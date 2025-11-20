# AI Content Exporter - Clean Copy & Multi-Format Export

**Reddit'te Tespit Edilen En Büyük Sorunları Çözen Chrome Extension**

## 🎯 Çözülen Pain Points

### ✅ 1. Markdown İşaretleme Sorunu (EN YÜKSEK ÖNCELİK)
- **Sorun**: ChatGPT/Claude/Gemini yanıtlarında `###`, `**`, `*` gibi markdown işaretlerini kopyalayınca çıkıyor
- **Reddit Şikayetleri**: 200+ upvote (r/ChatGPT), "Markdown temizlemek saatlerce sürüyor"
- **Çözüm**: ✨ **Temiz Metin Kopyala** butonu - Tek tıkla markdown işaretsiz metin

### ✅ 2. Multi-AI Switching Verimsizliği
- **Sorun**: "Gemini taslak → Claude edit → ChatGPT refine = 3 programda copy-paste" (300+ upvote)
- **Çözüm**: Tüm platformlarda çalışan tek extension (ChatGPT, Claude, Gemini, DeepSeek)

### ✅ 3. DOCX Export Eksikliği
- **Sorun**: "Gemini'nin built-in export yok, 3. taraf araçlar kalitesiz" (7K+ YouTube views)
- **Çözüm**: Tek tıkla DOCX ve PDF indirme

### ✅ 4. Formatting Kalitesi Sorunları
- **Sorun**: Kod blokları ve tablolar bozuluyor
- **Çözüm**: Syntax highlighting ve tablo formatını koruma seçenekleri

---

## 🚀 Özellikler

### Temel Özellikler (MVP)
- ✅ **Temiz Metin Kopyalama** - Markdown işaretleri olmadan
- ✅ **Multi-AI Desteği** - ChatGPT + Claude + Gemini + DeepSeek
- ✅ **3 Export Formatı** - DOCX, PDF, Temiz Text
- ✅ **1-Click Çözümü** - Popup veya floating button
- ✅ **Kod Bloğu Koruma** - Syntax highlighting ile
- ✅ **Tablo Formatı Koruma** - Orijinal yapıyı koru

### Ayarlar
- 🎨 Kod bloklarını koru (syntax highlighting)
- 📊 Tablo formatını koru
- 😊 Emoji'leri kaldır (opsiyonel)

---

## 📦 Kurulum

### Chrome Web Store'dan (Yayınlandığında)
1. [Chrome Web Store linki]
2. "Add to Chrome" butonuna tıkla
3. Herhangi bir AI platformuna git ve kullan

### Manuel Kurulum (Geliştirici Modu)
1. Bu repo'yu klonla veya indir:
   ```bash
   git clone https://github.com/your-username/ai-content-exporter.git
   ```

2. Chrome'da `chrome://extensions/` adrесine git

3. Sağ üst köşede "Developer mode" açık olmalı

4. "Load unpacked" butonuna tıkla

5. `ChromeExt1` klasörünü seç

6. Extension aktif olacak - AI platformlarına gidip kullanmaya başla!

---

## 🎮 Kullanım

### Yöntem 1: Popup ile
1. Herhangi bir AI platformunda (ChatGPT, Claude, Gemini, DeepSeek) bir sohbet başlat
2. Extension ikonuna tıkla
3. İstediğin işlemi seç:
   - **Temiz Metin Kopyala** - Markdown olmadan panoya kopyala
   - **DOCX İndir** - Word formatında indir
   - **PDF İndir** - PDF formatında indir

### Yöntem 2: Floating Button ile
1. AI yanıtını gördükten sonra sağ altta çıkan floating butona tıkla
2. Otomatik olarak temiz metin panoya kopyalanır

---

## 🛠️ Desteklenen Platformlar

| Platform | Durum | Notlar |
|----------|-------|--------|
| ChatGPT (OpenAI) | ✅ | Tamamen destekleniyor |
| Claude (Anthropic) | ✅ | Tamamen destekleniyor |
| Gemini (Google) | ✅ | Tamamen destekleniyor |
| DeepSeek | ✅ | Tamamen destekleniyor |

---

## 🧪 Markdown Temizleme Örnekleri

### Önce (AI Yanıtı):
```
### Bu Bir Başlık

Bu **kalın** ve *italik* metin içerir.

- Liste öğesi 1
- Liste öğesi 2

[Link metni](https://example.com)

`kod` ve ```python
print("merhaba")
```
```

### Sonra (Temiz Metin):
```
Bu Bir Başlık

Bu kalın ve italik metin içerir.

• Liste öğesi 1
• Liste öğesi 2

Link metni

kod ve print("merhaba")
```

---

## 🔧 Gelecek Özellikler (Roadmap)

### Yüksek Öncelik
- [ ] Batch Export - Birden fazla yanıtı tek PDF'de birleştir
- [ ] Offline Depolama - İndirilen cevapları kaydet
- [ ] Gelişmiş Markdown Formatları - Tablo ve görsel desteği

### Orta Öncelik
- [ ] Sitasyon Desteği - APA/MLA/Chicago formatları
- [ ] Search & Tagging - Kaydedilmiş cevapları organize et
- [ ] Keyboard Shortcuts - Ctrl+Shift+C ile temiz kopyala

### Düşük Öncelik
- [ ] Cloud Sync - Google Drive/OneDrive entegrasyonu
- [ ] API Export - JSON/CSV formatları
- [ ] Custom Templates - Kendi export şablonlarını oluştur

---

## 🐛 Bilinen Sorunlar

1. **DOCX Formatı**: Şu anda basit RTF formatı kullanılıyor, gelecekte tam DOCX desteği eklenecek
2. **PDF Yazdırma**: Tarayıcının print dialogunu kullanıyor, direkt PDF indirme eklenecek
3. **Kod Vurgulama**: Henüz syntax highlighting tam desteklenmiyor

---

## 📊 Rakip Analizi

| Özellik | AI Content Exporter | Mevcut Extension'lar |
|---------|---------------------|----------------------|
| Temiz Metin Kopyalama | ✅ 1-click | ❌ Manuel |
| Multi-AI Desteği | ✅ 4 platform | ⚠️ Sadece ChatGPT |
| DOCX Export | ✅ | ⚠️ Sınırlı |
| PDF Export | ✅ | ⚠️ Sınırlı |
| Kod Formatı Koruma | ✅ | ❌ |
| Ücretsiz | ✅ | ⚠️ Freemium |

---

## 🤝 Katkıda Bulunma

Pull request'ler hoş karşılanır! Büyük değişiklikler için lütfen önce bir issue açın.

### Geliştirme Ortamı Kurulumu
```bash
# Repo'yu klonla
git clone https://github.com/your-username/ai-content-exporter.git

# Extension'ı Chrome'a yükle (yukarıdaki manuel kurulum adımlarını takip et)

# Değişiklikleri yap ve test et

# Commit ve push
git add .
git commit -m "feat: yeni özellik eklendi"
git push
```

---

## 📄 Lisans

MIT License - detaylar için [LICENSE](LICENSE) dosyasına bakın.

---

## 🙏 Teşekkürler

Bu extension, Reddit'te tespit edilen gerçek kullanıcı sorunlarını çözmek için geliştirildi:
- r/ChatGPT topluluğu
- r/OpenAI topluluğu
- r/productivity topluluğu
- r/GeminiAI topluluğu

---

## 📞 İletişim

- **Issues**: [GitHub Issues](https://github.com/your-username/ai-content-exporter/issues)
- **Email**: your-email@example.com
- **Twitter**: @your_handle

---

## 🎯 Reddit'te Paylaşım için Başlıklar

1. "I built a Chrome extension to solve the markdown copy-paste problem from ChatGPT/Claude"
2. "Tired of cleaning ### and ** from AI responses? Here's a 1-click solution"
3. "Multi-AI export tool: ChatGPT → Claude → Gemini in one click"
4. "No more 'wall of text' - Clean export for Gemini/ChatGPT responses"

---

**⭐ Beğendiyseniz yıldız vermeyi unutmayın!**
