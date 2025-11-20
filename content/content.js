// Content Script - AI platformlarında çalışan ana script

// Platform-specific selectors
const PLATFORM_SELECTORS = {
  chatgpt: {
    // ChatGPT yeni arayüz (chatgpt.com) ve eski (chat.openai.com) destekler
    messages: 'article[data-testid^="conversation-turn"], [data-message-author-role="assistant"], .agent-turn',
    content: '.markdown, [class*="markdown"], .text-base',
    codeBlocks: 'pre code',
    tables: 'table'
  },
  claude: {
    messages: '[data-is-streaming="false"]',
    content: '.font-claude-message',
    codeBlocks: 'pre code',
    tables: 'table'
  },
  gemini: {
    messages: '.model-response-text',
    content: '.markdown',
    codeBlocks: 'pre code',
    tables: 'table'
  },
  deepseek: {
    messages: '.message-content',
    content: '.markdown-body',
    codeBlocks: 'pre code',
    tables: 'table'
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

// DOCX export handler
async function handleExportDocx(platform, settings) {
  try {
    const content = extractLastMessage(platform);
    if (!content) {
      throw new Error('Mesaj bulunamadı');
    }

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

// DOCX dosyası oluştur ve indir
async function downloadDocx(content, settings) {
  // docx kütüphanesini kullanmak yerine basit bir HTML-to-DOCX yaklaşımı
  // RTF formatında da kaydedilebilir

  const docxContent = createDocxContent(content, settings);
  const blob = new Blob([docxContent], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ai-export-${Date.now()}.docx`;
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

// DOCX için basit RTF içerik oluştur
function createDocxContent(content, settings) {
  // Basit RTF formatı - Word tarafından açılabilir
  const rtfHeader = `{\\rtf1\\ansi\\deff0
{\\fonttbl{\\f0 Times New Roman;}}
{\\colortbl;\\red0\\green0\\blue0;}
\\f0\\fs24`;

  let rtfContent = content
    .replace(/\n/g, '\\par\n')
    .replace(/[{}\\]/g, '\\$&');

  return rtfHeader + rtfContent + '}';
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

  // Butonu sayfaya ekle (opsiyonel - inline kullanım için)
  addFloatingButton();
})();

// Floating button ekle (hızlı erişim için)
function addFloatingButton() {
  const button = document.createElement('div');
  button.id = 'ai-exporter-btn';
  button.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
  `;
  button.title = 'Temiz metin kopyala (AI Exporter)';

  button.addEventListener('click', async () => {
    const platform = detectCurrentPlatform();
    const settings = await chrome.storage.sync.get({
      preserveCodeBlocks: true,
      preserveTables: true,
      removeEmojis: false
    });

    const result = await handleCleanCopy(platform, settings);

    if (result.success) {
      button.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
      setTimeout(() => {
        button.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      }, 1000);
    }
  });

  document.body.appendChild(button);
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
