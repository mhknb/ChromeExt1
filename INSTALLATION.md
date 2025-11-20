# Kurulum Rehberi - AI Content Exporter

## Chrome'a Manuel Yükleme (Geliştirici Modu)

### 1. Adım: Extension Dosyalarını İndir
```bash
git clone https://github.com/your-username/ai-content-exporter.git
cd ai-content-exporter
```

### 2. Adım: Chrome Extensions Sayfasını Aç
1. Chrome tarayıcınızda address bar'a şunu yazın:
   ```
   chrome://extensions/
   ```
2. Enter'a basın

### 3. Adım: Developer Mode'u Aktifleştir
- Sağ üst köşede "Developer mode" toggle'ını açın

### 4. Adım: Extension'ı Yükle
1. "Load unpacked" butonuna tıkayın
2. `ChromeExt1` klasörünü seçin (veya klonladığınız klasörü)
3. "Select Folder" butonuna tıklayın

### 5. Adım: Extension Aktif!
- Extension'ın aktif olduğunu toolbar'da göreceksiniz
- İkon görünmüyorsa extensions (puzzle piece) ikonuna tıklayıp pin edin

---

## İlk Kullanım

### Test Etmek İçin:
1. https://chat.openai.com adresine gidin (veya Claude, Gemini, DeepSeek)
2. Bir soru sorun ve yanıt alın
3. Extension ikonuna tıklayın
4. "Temiz Metin Kopyala" butonuna tıklayın
5. Not defterine yapıştırın - markdown işaretleri olmadan metin görmelisiniz!

---

## İkon Oluşturma (Geliştirici İçin)

PNG ikonları oluşturmak için:

```bash
# ImageMagick kullanarak SVG'den PNG oluşturma
convert -background none icons/icon.svg -resize 16x16 icons/icon16.png
convert -background none icons/icon.svg -resize 48x48 icons/icon48.png
convert -background none icons/icon.svg -resize 128x128 icons/icon128.png
```

Veya online araçlar:
- https://svgtopng.com/
- https://cloudconvert.com/svg-to-png

---

## Sorun Giderme

### Extension Yüklenmiyor
- Chrome sürümünüzün güncel olduğundan emin olun (Manifest V3 desteği gerekli)
- Developer mode'un açık olduğunu kontrol edin
- Konsol hatalarını kontrol edin: Extensions sayfasında "Errors" butonuna tıklayın

### Floating Button Görünmüyor
- Sayfayı yenileyin (F5)
- Extension'ın aktif olduğunu kontrol edin
- Console'da hata olup olmadığını kontrol edin (F12)

### Kopyalama Çalışmıyor
- Tarayıcının clipboard izni verdiğinden emin olun
- HTTPS sayfasında olduğunuzu kontrol edin (HTTP'de çalışmaz)

### DOCX/PDF İndirme Çalışmıyor
- Pop-up blocker'ın kapalı olduğundan emin olun
- İndirme izinlerinin aktif olduğunu kontrol edin

---

## Chrome Web Store'a Yayınlama (Geliştiriciler İçin)

### Hazırlık:
1. İkonları PNG formatında oluştur (16x16, 48x48, 128x128)
2. Screenshot'lar hazırla (1280x800 veya 640x400)
3. Promo grafikleri oluştur (440x280)
4. Privacy policy hazırla

### Yayınlama Adımları:
1. https://chrome.google.com/webstore/developer/dashboard adresine git
2. $5 developer fee öde (bir kereye mahsus)
3. "New Item" butonuna tıkla
4. Extension'ı zip olarak yükle:
   ```bash
   npm run package
   ```
5. Store listing bilgilerini doldur
6. "Submit for Review" butonuna tıkla

### Review Süresi:
- Genellikle 1-3 gün
- İlk yayında biraz daha uzun sürebilir

---

## Edge'e Yükleme

Microsoft Edge de Chrome extension'larını destekler:

1. Edge'de `edge://extensions/` adresine git
2. "Developer mode" aç
3. "Load unpacked" ile yükle

---

## Firefox'a Uyarlama

Manifest V3 farklılıkları:
- `manifest.json` dosyasında `browser_specific_settings` ekle
- `chrome.` API çağrılarını `browser.` ile değiştir

---

## Güncelleme

Extension'ı güncellemek için:
1. Değişiklikleri yap
2. `manifest.json` dosyasında version'ı artır
3. Extensions sayfasında reload butonuna tıkla

Auto-update (Chrome Web Store'dan sonra):
- Kullanıcılar otomatik güncellemeleri alacak
- Manuel kontrol: Extensions sayfasında "Update" butonu

---

## Destek

Sorunlarla karşılaşırsanız:
- [GitHub Issues](https://github.com/your-username/ai-content-exporter/issues)
- Email: your-email@example.com
