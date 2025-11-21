// Content Script - AI platformlarında çalışan ana script

/**
 * Normalize LaTeX for better Word compatibility
 * Converts Unicode math symbols to LaTeX and normalizes short-form commands
 * @param {string} markdown - Markdown with LaTeX
 * @returns {string} - Normalized markdown
 */
function normalizeLatexForWord(markdown) {
  let result = markdown;

  // Debug: Check input
  console.log('[Normalize] Input has $ signs:', result.includes('$'));
  console.log('[Normalize] Input sample:', result.substring(0, 300));

  // STEP 1: Convert Unicode math symbols to LaTeX WITH inline math delimiters
  // This handles cases where annotation extraction failed

  // Helper function to wrap symbol in $...$ if not already in math mode
  function wrapInMath(text, unicodeSymbol, latexCommand) {
    // Escape special regex characters in Unicode symbol
    const escapedSymbol = unicodeSymbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Track if any replacements were made
    let replacementCount = 0;

    const result = text.replace(new RegExp(escapedSymbol, 'g'), (match, offset) => {
      // Check if already inside $...$ or $$...$$
      const before = text.substring(0, offset);
      const after = text.substring(offset);

      // Count $ signs before this position
      const dollarsBefore = (before.match(/\$/g) || []).length;

      // If odd number of $ before, we're inside math mode - don't wrap
      if (dollarsBefore % 2 === 1) {
        return latexCommand;
      }

      // Check if inside $$...$$ block
      const blockStart = before.lastIndexOf('$$');
      const blockEnd = after.indexOf('$$');
      if (blockStart !== -1 && blockEnd !== -1 && blockStart > before.lastIndexOf('$$', blockStart - 1)) {
        return latexCommand;
      }

      // Not in math mode - wrap with $...$
      replacementCount++;
      return '$' + latexCommand + '$';
    });

    if (replacementCount > 0) {
      console.log(`[wrapInMath] Wrapped ${replacementCount} instances of "${unicodeSymbol}" → "$${latexCommand}$"`);
    }

    return result;
  }

  // Comparison operators
  result = wrapInMath(result, '≤', '\\leq');
  result = wrapInMath(result, '≥', '\\geq');
  result = wrapInMath(result, '≠', '\\neq');
  result = wrapInMath(result, '≈', '\\approx');
  result = wrapInMath(result, '≡', '\\equiv');

  // Set operations
  result = wrapInMath(result, '⊆', '\\subseteq');
  result = wrapInMath(result, '⊇', '\\supseteq');
  result = wrapInMath(result, '⊂', '\\subset');
  result = wrapInMath(result, '⊃', '\\supset');
  result = wrapInMath(result, '∈', '\\in');
  result = wrapInMath(result, '∉', '\\notin');
  result = wrapInMath(result, '∪', '\\cup');
  result = wrapInMath(result, '∩', '\\cap');
  result = wrapInMath(result, '∅', '\\emptyset');

  // Arithmetic
  result = wrapInMath(result, '×', '\\times');
  result = wrapInMath(result, '÷', '\\div');
  result = wrapInMath(result, '±', '\\pm');
  result = wrapInMath(result, '∓', '\\mp');

  // Calculus & Analysis
  result = wrapInMath(result, '∞', '\\infty');
  result = wrapInMath(result, '∫', '\\int');
  result = wrapInMath(result, '∑', '\\sum');
  result = wrapInMath(result, '∏', '\\prod');
  result = wrapInMath(result, '√', '\\sqrt');
  result = wrapInMath(result, '∂', '\\partial');
  result = wrapInMath(result, '∇', '\\nabla');

  // Greek letters (lowercase)
  result = wrapInMath(result, 'α', '\\alpha');
  result = wrapInMath(result, 'β', '\\beta');
  result = wrapInMath(result, 'γ', '\\gamma');
  result = wrapInMath(result, 'δ', '\\delta');
  result = wrapInMath(result, 'ε', '\\epsilon');
  result = wrapInMath(result, 'ζ', '\\zeta');
  result = wrapInMath(result, 'η', '\\eta');
  result = wrapInMath(result, 'θ', '\\theta');
  result = wrapInMath(result, 'ι', '\\iota');
  result = wrapInMath(result, 'κ', '\\kappa');
  result = wrapInMath(result, 'λ', '\\lambda');
  result = wrapInMath(result, 'μ', '\\mu');
  result = wrapInMath(result, 'ν', '\\nu');
  result = wrapInMath(result, 'ξ', '\\xi');
  result = wrapInMath(result, 'π', '\\pi');
  result = wrapInMath(result, 'ρ', '\\rho');
  result = wrapInMath(result, 'σ', '\\sigma');
  result = wrapInMath(result, 'τ', '\\tau');
  result = wrapInMath(result, 'υ', '\\upsilon');
  result = wrapInMath(result, 'φ', '\\phi');
  result = wrapInMath(result, 'χ', '\\chi');
  result = wrapInMath(result, 'ψ', '\\psi');
  result = wrapInMath(result, 'ω', '\\omega');

  // Greek letters (uppercase)
  result = wrapInMath(result, 'Γ', '\\Gamma');
  result = wrapInMath(result, 'Δ', '\\Delta');
  result = wrapInMath(result, 'Θ', '\\Theta');
  result = wrapInMath(result, 'Λ', '\\Lambda');
  result = wrapInMath(result, 'Ξ', '\\Xi');
  result = wrapInMath(result, 'Π', '\\Pi');
  result = wrapInMath(result, 'Σ', '\\Sigma');
  result = wrapInMath(result, 'Φ', '\\Phi');
  result = wrapInMath(result, 'Ψ', '\\Psi');
  result = wrapInMath(result, 'Ω', '\\Omega');

  // Logic
  result = wrapInMath(result, '∀', '\\forall');
  result = wrapInMath(result, '∃', '\\exists');
  result = wrapInMath(result, '¬', '\\neg');
  result = wrapInMath(result, '∧', '\\wedge');
  result = wrapInMath(result, '∨', '\\vee');
  result = wrapInMath(result, '⇒', '\\Rightarrow');
  result = wrapInMath(result, '⇔', '\\Leftrightarrow');
  result = wrapInMath(result, '→', '\\rightarrow');
  result = wrapInMath(result, '←', '\\leftarrow');

  // STEP 2: Normalize LaTeX short forms to long forms (Word compatibility)
  // Only do this INSIDE math mode
  result = result.replace(/\$([^$]+)\$/g, (match, mathContent) => {
    // Normalize inside inline math
    const normalized = mathContent
      .replace(/\\le\b/g, '\\leq')
      .replace(/\\ge\b/g, '\\geq');
    return '$' + normalized + '$';
  });

  result = result.replace(/\$\$([^$]+)\$\$/g, (match, mathContent) => {
    // Normalize inside block math
    const normalized = mathContent
      .replace(/\\le\b/g, '\\leq')
      .replace(/\\ge\b/g, '\\geq');
    return '$$' + normalized + '$$';
  });

  console.log('[Normalize] Output sample:', result.substring(0, 300));
  return result;
}

/**
 * Convert HTML element to Markdown
 * @param {HTMLElement} element - HTML element to convert
 * @returns {string} - Markdown string
 */
function htmlToMarkdown(element) {
  let markdown = '';

  // Process each child node
  for (const node of element.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      markdown += node.textContent;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const tag = node.tagName.toLowerCase();

      switch (tag) {
        case 'h1':
          markdown += `\n# ${node.textContent}\n\n`;
          break;
        case 'h2':
          markdown += `\n## ${node.textContent}\n\n`;
          break;
        case 'h3':
          markdown += `\n### ${node.textContent}\n\n`;
          break;
        case 'h4':
          markdown += `\n#### ${node.textContent}\n\n`;
          break;
        case 'h5':
          markdown += `\n##### ${node.textContent}\n\n`;
          break;
        case 'h6':
          markdown += `\n###### ${node.textContent}\n\n`;
          break;
        case 'p':
          markdown += htmlToMarkdown(node) + '\n\n';
          break;
        case 'strong':
        case 'b':
          markdown += `**${node.textContent}**`;
          break;
        case 'em':
        case 'i':
          markdown += `*${node.textContent}*`;
          break;
        case 'code':
          // Check if inside pre (code block) or inline code
          if (node.parentElement && node.parentElement.tagName === 'PRE') {
            const language = node.className.replace('language-', '');
            markdown += `\`\`\`${language}\n${node.textContent}\n\`\`\`\n\n`;
          } else {
            markdown += `\`${node.textContent}\``;
          }
          break;
        case 'pre':
          const codeElement = node.querySelector('code');
          if (codeElement) {
            const language = codeElement.className.replace('language-', '');
            markdown += `\`\`\`${language}\n${codeElement.textContent}\n\`\`\`\n\n`;
          } else {
            markdown += `\`\`\`\n${node.textContent}\n\`\`\`\n\n`;
          }
          break;
        case 'ul':
          for (const li of node.querySelectorAll('li')) {
            markdown += `- ${li.textContent}\n`;
          }
          markdown += '\n';
          break;
        case 'ol':
          let index = 1;
          for (const li of node.querySelectorAll('li')) {
            markdown += `${index}. ${li.textContent}\n`;
            index++;
          }
          markdown += '\n';
          break;
        case 'li':
          // Handled by ul/ol
          break;
        case 'a':
          const href = node.getAttribute('href') || '';
          markdown += `[${node.textContent}](${href})`;
          break;
        case 'br':
          markdown += '\n';
          break;
        case 'hr':
          markdown += '\n---\n\n';
          break;
        case 'blockquote':
          const lines = node.textContent.split('\n');
          markdown += lines.map(line => `> ${line}`).join('\n') + '\n\n';
          break;
        case 'table':
          // Basic table support - can be enhanced
          markdown += '\n' + node.outerHTML + '\n\n'; // Keep as HTML for now
          break;
        default:
          // Recursively process other elements
          markdown += htmlToMarkdown(node);
      }
    }
  }

  return markdown;
}

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

  // Önce LaTeX formüllerini koru (placeholder ile değiştir)
  const latexFormulas = [];
  // Block math: $$...$$
  cleaned = cleaned.replace(/\$\$([\s\S]+?)\$\$/g, (match, formula) => {
    const index = latexFormulas.length;
    latexFormulas.push({ type: 'block', formula });
    return `___LATEX_BLOCK_${index}___`;
  });
  // Inline math: $...$
  cleaned = cleaned.replace(/\$([^\$\n]+?)\$/g, (match, formula) => {
    const index = latexFormulas.length;
    latexFormulas.push({ type: 'inline', formula });
    return `___LATEX_INLINE_${index}___`;
  });

  // 0. Platform-specific başlıkları temizle (ChatGPT said:, Claude said:, etc.)
  cleaned = cleaned.replace(/(^|\n)(ChatGPT|Claude|Gemini|DeepSeek)\s+(said|söyledi):\s*/gi, '$1');
  cleaned = cleaned.replace(/(^|\n)(ChatGPT|Claude|Gemini|DeepSeek)\s*(\n|$)/gi, '$1');
  cleaned = cleaned.replace(/^\s*(ChatGPT|Claude|Gemini|DeepSeek)\s+(said|söyledi):\s*/i, '');

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

  // LaTeX formüllerini geri koy
  latexFormulas.forEach((item, index) => {
    const wrapper = item.type === 'block' ? '$$' : '$';
    cleaned = cleaned.replace(`___LATEX_BLOCK_${index}___`, `${wrapper}${item.formula}${wrapper}`);
    cleaned = cleaned.replace(`___LATEX_INLINE_${index}___`, `${wrapper}${item.formula}${wrapper}`);
  });

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
    // Use DocxConverterBundled from lib/docx-converter-bundled.js
    if (typeof window.DocxConverterBundled === 'undefined') {
      throw new Error('DOCX converter yüklenemedi');
    }

    const converter = new window.DocxConverterBundled();
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
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="18" height="18" fill="currentColor">
        <path d="M208 0H332.1c12.7 0 24.9 5.1 33.9 14.1l67.9 67.9c9 9 14.1 21.2 14.1 33.9V336c0 26.5-21.5 48-48 48H208c-26.5 0-48-21.5-48-48V48c0-26.5 21.5-48 48-48zM48 128h80v64H64V448H256V416h64v48c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V176c0-26.5 21.5-48 48-48z"/>
      </svg>
    </button>
    <button class="ai-export-btn" data-action="txt" title="TXT olarak indir">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="18" height="18" fill="currentColor">
        <path d="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zM256 0V128H384L256 0zM112 256h160c8.8 0 16 7.2 16 16s-7.2 16-16 16H112c-8.8 0-16-7.2-16-16s7.2-16 16-16zm0 64h160c8.8 0 16 7.2 16 16s-7.2 16-16 16H112c-8.8 0-16-7.2-16-16s7.2-16 16-16zm0 64h160c8.8 0 16 7.2 16 16s-7.2 16-16 16H112c-8.8 0-16-7.2-16-16s7.2-16 16-16z"/>
      </svg>
    </button>
    <button class="ai-export-btn" data-action="docx" title="DOCX olarak indir">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="18" height="18" fill="currentColor">
        <path d="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zM256 0V128H384L256 0zM111 257.1l26.8 89.2 31.6-90.3c3.4-9.6 12.5-16.1 22.7-16.1s19.3 6.4 22.7 16.1l31.6 90.3L273 257.1c3.8-12.7 17.2-19.9 29.9-16.1s19.9 17.2 16.1 29.9l-48 160c-3 10-12.1 16.9-22.4 17.1s-19.8-6.2-23.2-16.1L192 336.6l-33.3 95.3c-3.4 9.8-12.8 16.3-23.2 16.1s-19.5-7.1-22.4-17.1l-48-160c-3.8-12.7 3.4-26.1 16.1-29.9s26.1 3.4 29.9 16.1z"/>
      </svg>
    </button>
    <button class="ai-export-btn" data-action="pdf" title="PDF olarak indir">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="18" height="18" fill="currentColor">
        <path d="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zM256 0V128H384L256 0zM64 224H88c30.9 0 56 25.1 56 56s-25.1 56-56 56H80v32c0 8.8-7.2 16-16 16s-16-7.2-16-16V320 240c0-8.8 7.2-16 16-16zm24 80c13.3 0 24-10.7 24-24s-10.7-24-24-24H80v48h8zm72-64c0-8.8 7.2-16 16-16h24c26.5 0 48 21.5 48 48v64c0 26.5-21.5 48-48 48H176c-8.8 0-16-7.2-16-16V240zm32 112h8c8.8 0 16-7.2 16-16V272c0-8.8-7.2-16-16-16h-8v96zm96-112c0-8.8 7.2-16 16-16h48c8.8 0 16 7.2 16 16s-7.2 16-16 16H320v32h32c8.8 0 16 7.2 16 16s-7.2 16-16 16H320v48c0 8.8-7.2 16-16 16s-16-7.2-16-16V336 240z"/>
      </svg>
    </button>
  `;

  // Event listeners
  buttonsContainer.querySelectorAll('.ai-export-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      const action = btn.dataset.action;

      // İçeriği al - sadece markdown içeriği
      const platform = detectCurrentPlatform();
      const selectors = PLATFORM_SELECTORS[platform];

      const contentElement = messageElement.cloneNode(true);

      // Butonları kaldır
      const buttons = contentElement.querySelector('.ai-export-buttons');
      if (buttons) buttons.remove();

      // "ChatGPT said:" gibi başlıkları içeren elementleri kaldır
      // ChatGPT'de genellikle bu header/label elementlerinde oluyor
      const headers = contentElement.querySelectorAll('[data-message-author-role], .font-semibold, [class*="author"], header');
      headers.forEach(header => {
        const text = header.textContent || '';
        if (text.match(/(ChatGPT|Claude|Gemini|DeepSeek)\s*(said|söyledi)?:?/i)) {
          header.remove();
        }
      });

      // Sadece content alanını al ve HTML'i Markdown'a çevir
      let content;
      const contentArea = contentElement.querySelector(selectors.content);
      if (contentArea) {
        // Matematiksel formülleri LaTeX formatında koru
        // ChatGPT KaTeX annotation'larını bul ve işle

        // Method 1: Try MathML annotation (standard KaTeX output)
        const latexAnnotations = contentArea.querySelectorAll('annotation[encoding="application/x-tex"]');
        console.log(`[LaTeX] Found ${latexAnnotations.length} MathML annotations`);

        latexAnnotations.forEach(annotation => {
          // Get raw LaTeX code - preserve backslashes!
          let latexCode = annotation.textContent;
          console.log('[LaTeX] Original annotation:', latexCode);
          console.log('[LaTeX] Backslash count:', (latexCode.match(/\\/g) || []).length);

          // En dıştaki katex elementini bul
          let katexElement = annotation.closest('.katex');
          if (katexElement) {
            // Inline mi block mi kontrol et
            const isBlock = katexElement.classList.contains('katex-display');
            const wrapper = isBlock ? '$$' : '$';

            // Use string concatenation to preserve backslashes (safer than template literal)
            const latexText = wrapper + latexCode + wrapper;
            console.log('[LaTeX] Final markdown:', latexText);
            console.log('[LaTeX] Final backslash count:', (latexText.match(/\\/g) || []).length);

            // Create text node with preserved LaTeX
            const textNode = document.createTextNode(latexText);
            katexElement.parentNode.replaceChild(textNode, katexElement);
          }
        });

        // Method 2: Try finding .katex elements with data attributes (alternative)
        const katexElements = contentArea.querySelectorAll('.katex[data-latex], .katex-mathml, mjx-container');
        console.log(`[LaTeX] Found ${katexElements.length} alternative math elements`);

        katexElements.forEach(element => {
          const latex = element.getAttribute('data-latex') || element.getAttribute('data-expr');
          if (latex) {
            console.log('[LaTeX] Found from attribute:', latex);
            const isBlock = element.classList.contains('katex-display') || element.classList.contains('display');
            const wrapper = isBlock ? '$$' : '$';
            const textNode = document.createTextNode(`${wrapper}${latex}${wrapper}`);
            element.parentNode.replaceChild(textNode, element);
          }
        });

        // Convert HTML to Markdown preserving formatting
        content = htmlToMarkdown(contentArea).trim();
      } else {
        content = htmlToMarkdown(contentElement).trim();
      }

      // Normalize LaTeX for better Word compatibility
      content = normalizeLatexForWord(content);

      // Debug: Log extracted markdown
      console.log('=== Extracted Markdown ===');
      console.log(content);
      console.log('========================');

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
