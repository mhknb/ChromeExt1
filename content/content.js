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

  // Butonu sayfaya ekle (DOM hazır olduğunda)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addFloatingButton);
  } else {
    // DOM zaten hazır
    setTimeout(addFloatingButton, 1000);
  }
})();

// Floating button ekle (hızlı erişim için)
function addFloatingButton() {
  // Eğer zaten varsa ekleme
  if (document.getElementById('ai-exporter-btn')) {
    return;
  }

  // Body'nin hazır olduğunu kontrol et
  if (!document.body) {
    console.warn('AI Exporter: Body not ready, retrying...');
    setTimeout(addFloatingButton, 500);
    return;
  }

  const button = document.createElement('div');
  button.id = 'ai-exporter-btn';
  button.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
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
      button.innerHTML = '✓';
      button.style.fontSize = '24px';
      button.style.color = 'white';

      setTimeout(() => {
        button.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        button.innerHTML = `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        `;
      }, 1500);
    } else {
      // Hata durumunda
      button.style.background = 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)';
      setTimeout(() => {
        button.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      }, 1500);
    }
  });

  try {
    document.body.appendChild(button);
    console.log('AI Exporter: Floating button added');
  } catch (error) {
    console.error('AI Exporter: Failed to add button', error);
  }
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
