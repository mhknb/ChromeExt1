// Background service worker

// Extension yüklendiğinde
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('AI Content Exporter installed');

    // Varsayılan ayarları kaydet
    chrome.storage.sync.set({
      preserveCodeBlocks: true,
      preserveTables: true,
      removeEmojis: false
    });

    // Hoş geldiniz sayfasını aç (opsiyonel)
    // chrome.tabs.create({ url: 'welcome.html' });
  }

  if (details.reason === 'update') {
    console.log('AI Content Exporter updated');
  }
});

// Mesaj işleyici
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // İleride eklenmesi muhtemel özellikler için
  if (request.action === 'getStats') {
    // İstatistikleri döndür
    chrome.storage.local.get(['exportCount', 'copyCount'], (result) => {
      sendResponse({
        exportCount: result.exportCount || 0,
        copyCount: result.copyCount || 0
      });
    });
    return true;
  }

  if (request.action === 'incrementStat') {
    // İstatistik güncelle
    const key = request.stat;
    chrome.storage.local.get([key], (result) => {
      const newValue = (result[key] || 0) + 1;
      chrome.storage.local.set({ [key]: newValue });
    });
  }
});

// Keyboard shortcut (opsiyonel - ileride eklenebilir)
chrome.commands.onCommand.addListener((command) => {
  if (command === 'clean-copy') {
    // Aktif tab'a mesaj gönder
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'cleanCopy' });
      }
    });
  }
});
