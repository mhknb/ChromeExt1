// Content Script - AI platformlarında çalışan ana script

// Platform-specific selectors
const PLATFORM_SELECTORS = {
  chatgpt: {
    // ChatGPT - sadece en dış article container'ı seç (duplicate'leri önle)
    messages: 'article[data-testid^="conversation-turn"]:has([data-message-author-role="assistant"])',
    content: '.markdown, [class*="markdown"], .text-base',
    codeBlocks: 'pre code',
    tables: 'table',
    // Butonların ekleneceği container
    buttonContainer: '.agent-turn, [data-message-author-role="assistant"]'
  },
  claude: {
    messages: '[data-is-streaming="false"]',
    content: '.font-claude-message',
    codeBlocks: 'pre code',
    tables: 'table',
    buttonContainer: null // Mesajın kendisine ekle
  },
  gemini: {
    messages: '.model-response-text',
    content: '.markdown',
    codeBlocks: 'pre code',
    tables: 'table',
    buttonContainer: null
  },
  deepseek: {
    messages: '.message-content',
    content: '.markdown-body',
    codeBlocks: 'pre code',
    tables: 'table',
    buttonContainer: null
  }
};

// Message listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'cleanCopy') {
    handleCleanCopy(request.platform, request.settings)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }

  if (request.action === 'exportTxt') {
    handleExportTxt(request.platform, request.settings)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }

  if (request.action === 'exportDocx') {
    handleExportDocx(request.platform, request.settings)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }

  if (request.action === 'exportPdf') {
    handleExportPdf(request.platform, request.settings)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

// Clean copy handler - EN ÖNEMLİ ÖZELLİK
async function handleCleanCopy(platform, settings) {
  try {
    const content = extractLastMessage(platform);
    if (!content) {
      throw new Error('Mesaj bulunamadı');
    }

    const cleanText = cleanMarkdown(content, settings);
    await copyToClipboard(cleanText);

    return { success: true };
  } catch (error) {
    console.error('Clean copy error:', error);
    return { success: false, error: error.message };
  }
}

// Son AI mesajını çıkar
function extractLastMessage(platform) {
  const selectors = PLATFORM_SELECTORS[platform];
  if (!selectors) return null;

  const messages = document.querySelectorAll(selectors.messages);
  if (messages.length === 0) return null;

  const lastMessage = messages[messages.length - 1];
  return lastMessage.textContent || lastMessage.innerText;
}

// Markdown temizleme - PAIN POINT #1 ÇÖZÜMÜ
function cleanMarkdown(text, settings) {
  if (!text) return '';

  let cleaned = text;

  // 1. Markdown başlıkları temizle (###, ##, #)
  cleaned = cleaned.replace(/^#{1,6}\s+/gm, '');

  // 2. Bold/italic işaretleri temizle (**, *, __, _)
  cleaned = cleaned.replace(/(\*\*|__)(.*?)\1/g, '$2');
  cleaned = cleaned.replace(/(\*|_)(.*?)\1/g, '$2');

  // 3. Liste işaretlerini düzenle (-, *, +)
  cleaned = cleaned.replace(/^[\*\-\+]\s+/gm, '• ');

  // 4. Numaralı liste formatını koru
  cleaned = cleaned.replace(/^\d+\.\s+/gm, (match) => match);

  // 5. Code block işaretlerini temizle (```)
  if (!settings.preserveCodeBlocks) {
    cleaned = cleaned.replace(/```[\w]*\n?/g, '');
    cleaned = cleaned.replace(/`([^`]+)`/g, '$1');
  }

  // 6. Link markdown temizle [text](url) -> text
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');

  // 7. Emoji temizleme (opsiyonel)
  if (settings.removeEmojis) {
    cleaned = cleaned.replace(/[\u{1F300}-\u{1F9FF}]/gu, '');
  }

  // 8. Fazla boşlukları temizle
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  cleaned = cleaned.trim();

  return cleaned;
}

// Clipboard'a kopyala
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    // Fallback method
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
}

// TXT export handler
async function handleExportTxt(platform, settings) {
  try {
    const content = extractLastMessage(platform);
    if (!content) {
      throw new Error('Mesaj bulunamadı');
    }

    const cleanText = cleanMarkdown(content, settings);
    await downloadTxt(cleanText, settings);

    return { success: true };
  } catch (error) {
    console.error('TXT export error:', error);
    return { success: false, error: error.message };
  }
}

// DOCX export handler
async function handleExportDocx(platform, settings) {
  try {
    const content = extractLastMessage(platform);
    if (!content) {
      throw new Error('Mesaj bulunamadı');
    }

    // Don't clean markdown if preserving code blocks - keep original formatting
    const processedContent = settings.preserveCodeBlocks
      ? content
      : cleanMarkdown(content, settings);

    await downloadDocx(processedContent, settings);

    return { success: true };
  } catch (error) {
    console.error('DOCX export error:', error);
    return { success: false, error: error.message };
  }
}

// PDF export handler
async function handleExportPdf(platform, settings) {
  try {
    const content = extractLastMessage(platform);
    if (!content) {
      throw new Error('Mesaj bulunamadı');
    }

    const processedContent = settings.preserveCodeBlocks
      ? content
      : cleanMarkdown(content, settings);

    await downloadPdf(processedContent, settings);

    return { success: true };
  } catch (error) {
    console.error('PDF export error:', error);
    return { success: false, error: error.message };
  }
}

// TXT dosyası oluştur ve indir
async function downloadTxt(content, settings) {
  const blob = new Blob([content], {
    type: 'text/plain;charset=utf-8'
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ai-export-${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// DOCX dosyası oluştur ve indir
async function downloadDocx(content, settings) {
  try {
    // Use DocxConverter from lib/docx-converter.js
    if (typeof window.DocxConverter === 'undefined') {
      throw new Error('DOCX converter yüklenemedi');
    }

    const converter = new window.DocxConverter();
    const docxBlob = await converter.convertMarkdownToDocx(content);

    const url = URL.createObjectURL(docxBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-export-${Date.now()}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('DOCX generation failed:', error);
    throw error;
  }
}

// RTF dosyası oluştur ve indir (TXT butonundan sonra kaldırılabilir)
async function downloadRtf(content, settings) {
  const rtfContent = createRtfContent(content, settings);
  const blob = new Blob([rtfContent], {
    type: 'application/rtf'
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ai-export-${Date.now()}.rtf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// PDF dosyası oluştur ve indir
async function downloadPdf(content, settings) {
  // HTML içeriği oluştur ve yazdırma dialogunu aç
  const htmlContent = createPdfHtmlContent(content, settings);

  const printWindow = window.open('', '_blank');
  printWindow.document.write(htmlContent);
  printWindow.document.close();

  // Yazdırma dialogunu otomatik aç
  setTimeout(() => {
    printWindow.print();
  }, 500);
}

// RTF içerik oluştur (Word tarafından sorunsuz açılır)
function createRtfContent(content, settings) {
  // RTF 1.0 formatı - Word tarafından tam desteklenir
  const rtfHeader = '{\\rtf1\\ansi\\ansicpg1252\\deff0\n{\\fonttbl{\\f0\\fswiss\\fcharset0 Arial;}}\n{\\colortbl ;\\red0\\green0\\blue0;}\n\\viewkind4\\uc1\\pard\\cf1\\f0\\fs22 ';

  // İçeriği RTF formatına çevir
  let rtfBody = content
    // Özel karakterleri escape et
    .replace(/\\/g, '\\\\')
    .replace(/{/g, '\\{')
    .replace(/}/g, '\\}')
    // Satır sonları
    .replace(/\n\n/g, '\\par\\par\n')
    .replace(/\n/g, '\\par\n')
    // Unicode karakterler için
    .replace(/[\u0080-\uffff]/g, (char) => {
      return '\\u' + char.charCodeAt(0) + '?';
    });

  return rtfHeader + rtfBody + '\\par\n}';
}

// PDF için HTML içerik oluştur
function createPdfHtmlContent(content, settings) {
  const formattedContent = content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>AI Export</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
      color: #333;
    }
    pre {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 5px;
      overflow-x: auto;
    }
    code {
      font-family: 'Courier New', monospace;
      background: #f5f5f5;
      padding: 2px 6px;
      border-radius: 3px;
    }
    @media print {
      body {
        margin: 0;
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="content">
    ${formattedContent}
  </div>
  <script>
    // Sayfayı yazdırmak için kullanıcı etkileşimi bekliyoruz
    // window.print() otomatik çağrılacak
  </script>
</body>
</html>
  `;
}

// Sayfa yüklendiğinde initialize et
(function initialize() {
  console.log('AI Content Exporter loaded');

  // Her AI mesajına butonları ekle
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      addExportButtonsToAllMessages();
      observeNewMessages();
    });
  } else {
    // DOM zaten hazır
    setTimeout(() => {
      addExportButtonsToAllMessages();
      observeNewMessages();
    }, 1000);
  }
})();

// Tüm AI mesajlarına export butonları ekle
function addExportButtonsToAllMessages() {
  const platform = detectCurrentPlatform();
  if (!platform) return;

  const selectors = PLATFORM_SELECTORS[platform];
  if (!selectors) return;

  const messages = document.querySelectorAll(selectors.messages);
  console.log(`AI Exporter: Found ${messages.length} messages`);

  messages.forEach((message, index) => {
    // Eğer zaten butonlar eklenmişse skip et (data attribute ile kontrol)
    if (message.hasAttribute('data-export-buttons-added')) {
      return;
    }

    addExportButtonsToMessage(message, platform);
  });
}

// Tek bir mesaja export butonları ekle
function addExportButtonsToMessage(messageElement, platform) {
  // Duplicate check
  if (messageElement.hasAttribute('data-export-buttons-added')) {
    return;
  }

  const selectors = PLATFORM_SELECTORS[platform];

  // Butonların ekleneceği container'ı bul
  let targetContainer = messageElement;
  if (selectors.buttonContainer) {
    const foundContainer = messageElement.querySelector(selectors.buttonContainer);
    if (foundContainer) {
      targetContainer = foundContainer;
    }
  }

  const buttonsContainer = document.createElement('div');
  buttonsContainer.className = 'ai-export-buttons';
  buttonsContainer.innerHTML = `
    <button class="ai-export-btn" data-action="copy" title="Temiz metin kopyala">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
      </svg>
    </button>
    <button class="ai-export-btn" data-action="txt" title="TXT olarak indir">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
        <text x="8" y="16" font-size="6" fill="currentColor" font-weight="bold" font-family="Arial">TXT</text>
      </svg>
    </button>
    <button class="ai-export-btn" data-action="docx" title="DOCX olarak indir">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
        <text x="10" y="16.5" font-size="8" fill="currentColor" font-weight="bold" font-family="Arial">W</text>
      </svg>
    </button>
    <button class="ai-export-btn" data-action="pdf" title="PDF olarak indir">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
        <text x="7" y="16" font-size="5.5" fill="currentColor" font-weight="bold" font-family="Arial">PDF</text>
      </svg>
    </button>
  `;

  // Event listeners
  buttonsContainer.querySelectorAll('.ai-export-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      const action = btn.dataset.action;
      const content = messageElement.textContent || messageElement.innerText;

      await handleExportAction(action, content, btn);
    });
  });

  // Butonları ekle
  targetContainer.appendChild(buttonsContainer);

  // Duplicate eklemeyi önlemek için flag
  messageElement.setAttribute('data-export-buttons-added', 'true');
}

// Export aksiyonunu handle et
async function handleExportAction(action, content, buttonElement) {
  const settings = await chrome.storage.sync.get({
    preserveCodeBlocks: true,
    preserveTables: true,
    removeEmojis: false
  });

  try {
    // Butonu loading state'e al
    buttonElement.classList.add('loading');

    switch (action) {
      case 'copy':
        const cleanText = cleanMarkdown(content, settings);
        await copyToClipboard(cleanText);
        showButtonSuccess(buttonElement, '✓');
        break;

      case 'txt':
        const txtContent = cleanMarkdown(content, settings);
        await downloadTxt(txtContent, settings);
        showButtonSuccess(buttonElement, '✓');
        break;

      case 'docx':
        const docxContent = settings.preserveCodeBlocks ? content : cleanMarkdown(content, settings);
        await downloadDocx(docxContent, settings);
        showButtonSuccess(buttonElement, '✓');
        break;

      case 'pdf':
        const pdfContent = settings.preserveCodeBlocks ? content : cleanMarkdown(content, settings);
        await downloadPdf(pdfContent, settings);
        showButtonSuccess(buttonElement, '✓');
        break;
    }
  } catch (error) {
    console.error('Export failed:', error);
    showButtonError(buttonElement);
  }
}

// Buton başarı feedback'i
function showButtonSuccess(button, icon) {
  button.classList.remove('loading');
  button.classList.add('success');
  const originalHTML = button.innerHTML;
  button.innerHTML = icon;

  setTimeout(() => {
    button.classList.remove('success');
    button.innerHTML = originalHTML;
  }, 2000);
}

// Buton hata feedback'i
function showButtonError(button) {
  button.classList.remove('loading');
  button.classList.add('error');

  setTimeout(() => {
    button.classList.remove('error');
  }, 2000);
}

// Yeni mesajları izle (MutationObserver)
function observeNewMessages() {
  const platform = detectCurrentPlatform();
  if (!platform) return;

  const selectors = PLATFORM_SELECTORS[platform];
  if (!selectors) return;

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) { // Element node
          // Yeni mesaj mı kontrol et
          if (node.matches && node.matches(selectors.messages)) {
            if (!node.hasAttribute('data-export-buttons-added')) {
              addExportButtonsToMessage(node, platform);
            }
          }

          // Alt elementlerde yeni mesaj var mı kontrol et
          const newMessages = node.querySelectorAll(selectors.messages);
          newMessages.forEach(msg => {
            if (!msg.hasAttribute('data-export-buttons-added')) {
              addExportButtonsToMessage(msg, platform);
            }
          });
        }
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  console.log('AI Exporter: Observing new messages');
}

// Platform tespiti
function detectCurrentPlatform() {
  const url = window.location.href;
  if (url.includes('chat.openai.com') || url.includes('chatgpt.com')) return 'chatgpt';
  if (url.includes('claude.ai')) return 'claude';
  if (url.includes('gemini.google.com')) return 'gemini';
  if (url.includes('chat.deepseek.com')) return 'deepseek';
  return null;
}
