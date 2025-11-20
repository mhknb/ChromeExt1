// Popup script - UI kontrolü
let currentPlatform = null;

document.addEventListener('DOMContentLoaded', async () => {
  // Platform tespiti
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  detectPlatform(tab.url);

  // Event listeners
  document.getElementById('cleanCopyBtn').addEventListener('click', handleCleanCopy);
  document.getElementById('exportDocxBtn').addEventListener('click', handleExportDocx);
  document.getElementById('exportPdfBtn').addEventListener('click', handleExportPdf);

  // Ayarları yükle
  loadSettings();
});

function detectPlatform(url) {
  const platformDot = document.getElementById('platformDot');
  const platformName = document.getElementById('platformName');
  const buttons = document.querySelectorAll('.action-btn');

  if (url.includes('chat.openai.com') || url.includes('chatgpt.com')) {
    currentPlatform = 'chatgpt';
    platformName.textContent = 'ChatGPT tespit edildi';
    platformDot.classList.add('active');
    enableButtons(buttons);
  } else if (url.includes('claude.ai')) {
    currentPlatform = 'claude';
    platformName.textContent = 'Claude tespit edildi';
    platformDot.classList.add('active');
    enableButtons(buttons);
  } else if (url.includes('gemini.google.com')) {
    currentPlatform = 'gemini';
    platformName.textContent = 'Gemini tespit edildi';
    platformDot.classList.add('active');
    enableButtons(buttons);
  } else if (url.includes('chat.deepseek.com')) {
    currentPlatform = 'deepseek';
    platformName.textContent = 'DeepSeek tespit edildi';
    platformDot.classList.add('active');
    enableButtons(buttons);
  } else {
    platformName.textContent = 'Desteklenmeyen platform';
    platformDot.classList.add('inactive');
  }
}

function enableButtons(buttons) {
  buttons.forEach(btn => btn.removeAttribute('disabled'));
}

async function handleCleanCopy() {
  showStatus('Temiz metin kopyalanıyor...', 'info');

  const settings = await getSettings();

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.tabs.sendMessage(tab.id, {
    action: 'cleanCopy',
    platform: currentPlatform,
    settings: settings
  }, (response) => {
    if (chrome.runtime.lastError) {
      showStatus('Hata: ' + chrome.runtime.lastError.message, 'error');
      return;
    }

    if (response && response.success) {
      showStatus('✓ Temiz metin kopyalandı!', 'success');
    } else {
      showStatus('Metin kopyalanamadı', 'error');
    }
  });
}

async function handleExportDocx() {
  showStatus('Word dosyası oluşturuluyor...', 'info');

  const settings = await getSettings();

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.tabs.sendMessage(tab.id, {
    action: 'exportDocx',
    platform: currentPlatform,
    settings: settings
  }, (response) => {
    if (chrome.runtime.lastError) {
      showStatus('Hata: ' + chrome.runtime.lastError.message, 'error');
      return;
    }

    if (response && response.success) {
      showStatus('✓ Word dosyası indirildi!', 'success');
    } else {
      showStatus('Word dosyası oluşturulamadı', 'error');
    }
  });
}

async function handleExportPdf() {
  showStatus('PDF dosyası oluşturuluyor...', 'info');

  const settings = await getSettings();

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.tabs.sendMessage(tab.id, {
    action: 'exportPdf',
    platform: currentPlatform,
    settings: settings
  }, (response) => {
    if (chrome.runtime.lastError) {
      showStatus('Hata: ' + chrome.runtime.lastError.message, 'error');
      return;
    }

    if (response && response.success) {
      showStatus('✓ PDF dosyası indirildi!', 'success');
    } else {
      showStatus('PDF oluşturulamadı', 'error');
    }
  });
}

function showStatus(message, type) {
  const statusMessage = document.getElementById('statusMessage');
  statusMessage.textContent = message;
  statusMessage.className = `status-message ${type}`;

  if (type === 'success' || type === 'error') {
    setTimeout(() => {
      statusMessage.textContent = '';
      statusMessage.className = 'status-message';
    }, 3000);
  }
}

async function getSettings() {
  return {
    preserveCodeBlocks: document.getElementById('preserveCodeBlocks').checked,
    preserveTables: document.getElementById('preserveTables').checked,
    removeEmojis: document.getElementById('removeEmojis').checked
  };
}

async function loadSettings() {
  const result = await chrome.storage.sync.get({
    preserveCodeBlocks: true,
    preserveTables: true,
    removeEmojis: false
  });

  document.getElementById('preserveCodeBlocks').checked = result.preserveCodeBlocks;
  document.getElementById('preserveTables').checked = result.preserveTables;
  document.getElementById('removeEmojis').checked = result.removeEmojis;

  // Ayarları kaydet
  document.getElementById('preserveCodeBlocks').addEventListener('change', saveSettings);
  document.getElementById('preserveTables').addEventListener('change', saveSettings);
  document.getElementById('removeEmojis').addEventListener('change', saveSettings);
}

async function saveSettings() {
  const settings = await getSettings();
  await chrome.storage.sync.set(settings);
}
