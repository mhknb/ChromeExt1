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

### v2.0.0 - Yeni Özellikler! 🎉
- ✨ **Markdown Export** - GitHub/Notion uyumlu .md dosyaları
- 🎨 **Gelişmiş Syntax Highlighting** - Kod blokları için profesyonel renklendirme
- 📐 **LaTeX Desteği** - Matematiksel formüller için KaTeX rendering
- 📊 **Gelişmiş Tablo Formatı** - GFM uyumlu tablolar
- ⚡ **İki Seviyeli PDF Export** - Hızlı PDF (5 saniye) veya Kaliteli PDF (profesyonel)
- 🎯 **Gelişmiş DOCX Kalitesi** - Custom fonts, header/footer, sayfa numaraları
- 🚀 **Performans Optimizasyonu** - Web Workers ile büyük içerik desteği

### Temel Özellikler
- ✅ **Temiz Metin Kopyalama** - Markdown işaretleri olmadan
- ✅ **Multi-AI Desteği** - ChatGPT + Claude + Gemini + DeepSeek
- ✅ **4 Export Formatı** - Markdown, DOCX, PDF (Fast), PDF (Quality)
- ✅ **1-Click Çözümü** - Popup veya floating button
- ✅ **Kod Bloğu Koruma** - Syntax highlighting ile (highlight.js)
- ✅ **Tablo Formatı Koruma** - Orijinal yapıyı koru
- ✅ **LaTeX Formül Desteği** - Matematiksel gösterimler için

### Export Kalite Seçenekleri

#### Markdown Export
- GitHub Flavored Markdown (GFM) uyumlu
- Kod bloklarını dil bilgisi ile koruma
- LaTeX formüllerini orijinal formatında koruma
- Platform başlıklarını otomatik temizleme

#### DOCX Export (Enhanced)
- Syntax-highlighted kod blokları
- LaTeX formüllerini Word equation formatına dönüştürme
- Custom font embedding (Source Code Pro)
- Header/footer ile sayfa numaraları
- Profesyonel tablo styling
- Heading style mapping (h1-h6 → Heading 1-6)

#### PDF Export - Fast Mode
- 5 saniye içinde hızlı export
- KaTeX ile render edilmiş formüller
- Temel syntax highlighting
- Orta boyutlu içerik için ideal

#### PDF Export - Quality Mode
- Profesyonel kalite output
- Custom font embedding (Roboto, Source Code Pro)
- Yüksek çözünürlüklü syntax highlighting
- Header/footer ile sayfa numaraları ve tarih
- Akıllı sayfa sonları (başlıkları bölmez)
- Otomatik içindekiler tablosu (uzun içerik için)
- Optimize edilmiş tablo layoutları

### Ayarlar
- 🎨 Kod bloklarını koru (syntax highlighting)
- 📊 Tablo formatını koru
- 😊 Emoji'leri kaldır (opsiyonel)
- ⚙️ PDF kalite tercihi (Hızlı/Kaliteli)
- 🔤 Font embedding seçenekleri
- 📄 Header/footer tercihleri

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
   - **MD İndir** - Markdown formatında indir (YENİ! v2.0)
   - **DOCX İndir** - Gelişmiş Word formatında indir
   - **PDF İndir (Hızlı)** - 5 saniyede hızlı PDF
   - **PDF İndir (Kaliteli)** - Profesyonel kalite PDF

### Yöntem 2: Floating Button ile
1. AI yanıtını gördükten sonra sağ altta çıkan floating butona tıkla
2. Otomatik olarak temiz metin panoya kopyalanır

### Yeni Özellikler (v2.0)

#### Markdown Export
- GitHub, Notion, Obsidian gibi platformlarda kullanmak için ideal
- Kod bloklarını ```language formatında korur
- LaTeX formüllerini $...$ ve $$...$$ formatında korur
- Tabloları GFM standardına uygun şekilde export eder

#### Gelişmiş PDF Seçenekleri
**Hızlı PDF**: Hızlı önizleme ve paylaşım için
- 5 saniye içinde hazır
- Temel formatting
- Orta boyutlu içerik için ideal

**Kaliteli PDF**: Profesyonel dokümantasyon için
- Custom font embedding
- Yüksek çözünürlüklü syntax highlighting
- Akıllı sayfa sonları
- Header/footer ile sayfa numaraları
- Uzun içerik için otomatik içindekiler tablosu

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

### v2.1 (Planlanan)
- [ ] Batch Export - Birden fazla yanıtı tek PDF'de birleştir
- [ ] Export History - Önceki export'ları görüntüle ve yönet
- [ ] Custom Templates - Kendi export şablonlarını oluştur
- [ ] Keyboard Shortcuts - Ctrl+Shift+C ile temiz kopyala

### v2.2 (Planlanan)
- [ ] Offline Depolama - İndirilen cevapları kaydet
- [ ] Sitasyon Desteği - APA/MLA/Chicago formatları
- [ ] Search & Tagging - Kaydedilmiş cevapları organize et

### v3.0 (Uzun Vadeli)
- [ ] Cloud Sync - Google Drive/OneDrive entegrasyonu
- [ ] API Export - JSON/CSV formatları
- [ ] Collaborative Features - Paylaşım ve işbirliği özellikleri
- [ ] Plugin System - Üçüncü taraf eklentiler

---

## 🐛 Bilinen Sorunlar

v2.0.0 ile birçok sorun çözüldü! 🎉

### Çözülen Sorunlar (v2.0)
- ✅ **DOCX Formatı**: Artık tam DOCX desteği ile profesyonel kalite
- ✅ **PDF İndirme**: Direkt PDF indirme iki kalite seviyesi ile
- ✅ **Kod Vurgulama**: Tam syntax highlighting desteği (highlight.js)
- ✅ **LaTeX Desteği**: KaTeX ile matematiksel formül rendering
- ✅ **Performans**: Web Workers ile büyük içerik desteği

### Aktif Sorunlar
Şu anda bilinen kritik sorun bulunmamaktadır. Sorun bildirmek için [GitHub Issues](https://github.com/your-username/ai-content-exporter/issues) kullanabilirsiniz.

---

## 📊 Rakip Analizi

| Özellik | AI Content Exporter v2.0 | Mevcut Extension'lar |
|---------|--------------------------|----------------------|
| Temiz Metin Kopyalama | ✅ 1-click | ❌ Manuel |
| Multi-AI Desteği | ✅ 4 platform | ⚠️ Sadece ChatGPT |
| Markdown Export | ✅ GFM uyumlu | ❌ |
| DOCX Export | ✅ Profesyonel kalite | ⚠️ Sınırlı |
| PDF Export | ✅ İki kalite seviyesi | ⚠️ Tek seviye |
| Syntax Highlighting | ✅ highlight.js | ❌ |
| LaTeX Desteği | ✅ KaTeX rendering | ❌ |
| Kod Formatı Koruma | ✅ | ❌ |
| Custom Fonts | ✅ | ❌ |
| Performans Optimizasyonu | ✅ Web Workers | ❌ |
| Ücretsiz | ✅ | ⚠️ Freemium |

---

## 📝 Changelog

### v2.0.0 (2024) - Major Update 🎉

#### Yeni Özellikler
- ✨ **Markdown Export**: GitHub Flavored Markdown (GFM) uyumlu .md dosyaları
- 🎨 **Gelişmiş Syntax Highlighting**: highlight.js ile profesyonel kod renklendirme
- 📐 **LaTeX Desteği**: KaTeX ile matematiksel formül rendering
- ⚡ **İki Seviyeli PDF**: Hızlı PDF (5 saniye) ve Kaliteli PDF (profesyonel)
- 📊 **Gelişmiş Tablo Desteği**: GFM uyumlu tablolar ve optimize edilmiş layoutlar
- 🎯 **DOCX Kalite İyileştirmeleri**: Custom fonts, header/footer, sayfa numaraları
- 🚀 **Performans Optimizasyonu**: Web Workers ile büyük içerik desteği (>100KB)

#### İyileştirmeler
- 📄 DOCX export artık Word equation formatını destekliyor
- 🎨 Kod blokları için Source Code Pro font embedding
- 📊 Tablolar için otomatik column width optimization
- 🔤 Unicode matematik sembollerini LaTeX'e normalize etme
- ⚙️ Gelişmiş ayarlar yönetimi ve persistence
- 🛡️ Gelişmiş hata yönetimi ve graceful degradation
- 📦 Lazy loading ile daha hızlı initial load

#### Teknik İyileştirmeler
- Modüler mimari ile daha iyi kod organizasyonu
- Comprehensive test coverage (unit + property-based tests)
- Webpack optimizasyonları (tree-shaking, code splitting)
- Chrome storage API ile ayar persistence
- Platform-specific UI element filtering

### v1.1.0 (2024)
- İlk stabil sürüm
- Temel DOCX ve PDF export
- Multi-AI platform desteği
- Temiz metin kopyalama

## 🤝 Katkıda Bulunma

Pull request'ler hoş karşılanır! Büyük değişiklikler için lütfen önce bir issue açın.

### Geliştirme Ortamı Kurulumu
```bash
# Repo'yu klonla
git clone https://github.com/your-username/ai-content-exporter.git

# Bağımlılıkları yükle
npm install

# Webpack ile bundle'ları oluştur
npm run build

# Test'leri çalıştır
npm test

# Extension'ı Chrome'a yükle (yukarıdaki manuel kurulum adımlarını takip et)

# Geliştirme modunda çalış (otomatik rebuild)
npm run watch

# Değişiklikleri yap ve test et

# Commit ve push
git add .
git commit -m "feat: yeni özellik eklendi"
git push
```

### Teknik Mimari (v2.0)

#### Katmanlı Mimari
```
Content Script Layer
  ├── Content Extractor (Platform-specific extraction)
  └── UI Manager (Button injection)

Processing Layer
  ├── Markdown Processor (Parsing & normalization)
  ├── LaTeX Renderer (KaTeX integration)
  └── Syntax Highlighter (highlight.js integration)

Export Layer
  ├── Markdown Exporter (GFM output)
  ├── DOCX Exporter Enhanced (@m2d/core + custom renderers)
  ├── PDF Fast Exporter (html2pdf.js)
  └── PDF Quality Exporter (pdfmake)

Storage Layer
  ├── Settings Manager (Chrome storage API)
  └── Cache Manager (Performance optimization)
```

#### Kullanılan Kütüphaneler
- **DOCX**: @m2d/core, @m2d/math, @m2d/table
- **PDF**: pdfmake, html2pdf.js, jspdf
- **Markdown**: remark, remark-gfm, remark-math, turndown
- **Rendering**: KaTeX, highlight.js
- **Testing**: Vitest, fast-check (property-based testing)
- **Build**: Webpack 5

#### Test Stratejisi
- **Unit Tests**: Core functionality testing
- **Property-Based Tests**: Correctness properties validation
- **Integration Tests**: End-to-end export flows
- **Performance Tests**: Export time benchmarks

Test çalıştırma:
```bash
npm test              # Tüm testleri çalıştır
npm run test:watch    # Watch modunda test
npm run test:coverage # Coverage raporu
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
