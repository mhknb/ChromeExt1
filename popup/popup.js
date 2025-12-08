// Popup script - UI kontrolü
let currentPlatform = null;

document.addEventListener('DOMContentLoaded', async () => {
  // Platform tespiti
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  detectPlatform(tab.url);

  // Event listeners
  document.getElementById('cleanCopyBtn').addEventListener('click', handleCleanCopy);
  document.getElementById('exportTxtBtn').addEventListener('click', handleExportTxt);
  document.getElementById('exportMdBtn').addEventListener('click', handleExportMd);
  document.getElementById('exportDocxBtn').addEventListener('click', handleExportDocx);
  document.getElementById('exportPdfBtn').addEventListener('click', handleExportPdf);
  
  // PDF quality modal listeners
  document.getElementById('pdfFastBtn').addEventListener('click', () => handlePdfExport('fast'));
  document.getElementById('pdfQualityBtn').addEventListener('click', () => handlePdfExport('quality'));
  document.getElementById('modalCloseBtn').addEventListener('click', closePdfModal);
  
  // Settings listeners
  document.getElementById('resetSettingsBtn').addEventListener('click', handleResetSettings);

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

async function handleExportTxt() {
  showStatus('TXT dosyası oluşturuluyor...', 'info');

  const settings = await getSettings();

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.tabs.sendMessage(tab.id, {
    action: 'exportTxt',
    platform: currentPlatform,
    settings: settings
  }, (response) => {
    if (chrome.runtime.lastError) {
      showStatus('Hata: ' + chrome.runtime.lastError.message, 'error');
      return;
    }

    if (response && response.success) {
      showStatus('✓ TXT dosyası indirildi!', 'success');
    } else {
      showStatus('TXT oluşturulamadı', 'error');
    }
  });
}

async function handleExportMd() {
  showStatus('Markdown dosyası oluşturuluyor...', 'info');
  showProgress(0, 'Markdown export başlatılıyor...');

  const settings = await getSettings();

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Simulate progress for fast export
  let progress = 0;
  const progressInterval = setInterval(() => {
    progress += 10;
    if (progress <= 90) {
      showProgress(progress, 'Markdown oluşturuluyor...');
    }
  }, 100);

  chrome.tabs.sendMessage(tab.id, {
    action: 'exportMd',
    platform: currentPlatform,
    settings: settings
  }, (response) => {
    clearInterval(progressInterval);
    hideProgress();

    if (chrome.runtime.lastError) {
      showStatus('Hata: ' + chrome.runtime.lastError.message, 'error');
      return;
    }

    if (response && response.success) {
      showStatus('✓ Markdown dosyası indirildi!', 'success');
    } else {
      showStatus('Markdown oluşturulamadı', 'error');
    }
  });
}

async function handleExportDocx() {
  showStatus('DOCX dosyası oluşturuluyor...', 'info');
  showProgress(0, 'DOCX export başlatılıyor...');

  const settings = await getSettings();

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Simulate progress for medium-length export
  let progress = 0;
  const progressInterval = setInterval(() => {
    progress += 5;
    if (progress <= 90) {
      showProgress(progress, 'DOCX oluşturuluyor...');
    }
  }, 150);

  chrome.tabs.sendMessage(tab.id, {
    action: 'exportDocx',
    platform: currentPlatform,
    settings: settings
  }, (response) => {
    clearInterval(progressInterval);
    hideProgress();

    if (chrome.runtime.lastError) {
      showStatus('Hata: ' + chrome.runtime.lastError.message, 'error');
      return;
    }

    if (response && response.success) {
      showStatus('✓ DOCX dosyası indirildi!', 'success');
    } else {
      showStatus('DOCX oluşturulamadı', 'error');
    }
  });
}

async function handleExportPdf() {
  // Show PDF quality selection modal
  document.getElementById('pdfQualityModal').style.display = 'flex';
}

async function handlePdfExport(quality) {
  closePdfModal();
  
  const qualityLabel = quality === 'fast' ? 'Hızlı' : 'Kaliteli';
  showStatus(`${qualityLabel} PDF oluşturuluyor...`, 'info');
  showProgress(0, `${qualityLabel} PDF export başlatılıyor...`);

  const settings = await getSettings();

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Simulate progress based on quality
  const progressSpeed = quality === 'fast' ? 100 : 200;
  let progress = 0;
  const progressInterval = setInterval(() => {
    progress += 5;
    if (progress <= 90) {
      showProgress(progress, `${qualityLabel} PDF oluşturuluyor...`);
    }
  }, progressSpeed);

  chrome.tabs.sendMessage(tab.id, {
    action: 'exportPdf',
    platform: currentPlatform,
    quality: quality,
    settings: settings
  }, (response) => {
    clearInterval(progressInterval);
    hideProgress();

    if (chrome.runtime.lastError) {
      showStatus('Hata: ' + chrome.runtime.lastError.message, 'error');
      return;
    }

    if (response && response.success) {
      showStatus(`✓ ${qualityLabel} PDF indirildi!`, 'success');
    } else {
      showStatus('PDF oluşturulamadı', 'error');
    }
  });
}

function closePdfModal() {
  document.getElementById('pdfQualityModal').style.display = 'none';
}

async function handleResetSettings() {
  if (confirm('Tüm ayarları varsayılana döndürmek istediğinizden emin misiniz?')) {
    const defaults = {
      preserveCodeBlocks: true,
      preserveTables: true,
      removeEmojis: false,
      docxEmbedFonts: true,
      docxIncludeHeader: true,
      pdfIncludeTOC: false,
      pdfDefaultQuality: 'fast'
    };
    
    await chrome.storage.sync.set(defaults);
    loadSettings();
    showStatus('✓ Ayarlar varsayılana döndürüldü', 'success');
  }
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

function showProgress(percent, message) {
  const progressContainer = document.getElementById('progressContainer');
  const progressFill = document.getElementById('progressFill');
  const progressText = document.getElementById('progressText');
  
  progressContainer.style.display = 'block';
  progressFill.style.width = `${percent}%`;
  progressText.textContent = message || `İşleniyor... ${percent}%`;
}

function hideProgress() {
  const progressContainer = document.getElementById('progressContainer');
  progressContainer.style.display = 'none';
}

async function getSettings() {
  return {
    preserveCodeBlocks: document.getElementById('preserveCodeBlocks').checked,
    preserveTables: document.getElementById('preserveTables').checked,
    removeEmojis: document.getElementById('removeEmojis').checked,
    docxEmbedFonts: document.getElementById('docxEmbedFonts').checked,
    docxIncludeHeader: document.getElementById('docxIncludeHeader').checked,
    pdfIncludeTOC: document.getElementById('pdfIncludeTOC').checked,
    pdfDefaultQuality: document.getElementById('pdfDefaultQuality').value
  };
}

async function loadSettings() {
  const result = await chrome.storage.sync.get({
    preserveCodeBlocks: true,
    preserveTables: true,
    removeEmojis: false,
    docxEmbedFonts: true,
    docxIncludeHeader: true,
    pdfIncludeTOC: false,
    pdfDefaultQuality: 'fast'
  });

  document.getElementById('preserveCodeBlocks').checked = result.preserveCodeBlocks;
  document.getElementById('preserveTables').checked = result.preserveTables;
  document.getElementById('removeEmojis').checked = result.removeEmojis;
  document.getElementById('docxEmbedFonts').checked = result.docxEmbedFonts;
  document.getElementById('docxIncludeHeader').checked = result.docxIncludeHeader;
  document.getElementById('pdfIncludeTOC').checked = result.pdfIncludeTOC;
  document.getElementById('pdfDefaultQuality').value = result.pdfDefaultQuality;

  // Ayarları kaydet
  document.getElementById('preserveCodeBlocks').addEventListener('change', saveSettings);
  document.getElementById('preserveTables').addEventListener('change', saveSettings);
  document.getElementById('removeEmojis').addEventListener('change', saveSettings);
  document.getElementById('docxEmbedFonts').addEventListener('change', saveSettings);
  document.getElementById('docxIncludeHeader').addEventListener('change', saveSettings);
  document.getElementById('pdfIncludeTOC').addEventListener('change', saveSettings);
  document.getElementById('pdfDefaultQuality').addEventListener('change', saveSettings);
}

async function saveSettings() {
  const settings = await getSettings();
  await chrome.storage.sync.set(settings);
  showStatus('✓ Ayarlar kaydedildi', 'success');
}
