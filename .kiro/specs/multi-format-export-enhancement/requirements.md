# Requirements Document

## Introduction

Bu özellik, AI Content Exporter Chrome Extension'ının export kalitesini ve format çeşitliliğini artırmayı amaçlamaktadır. Mevcut DOCX ve PDF export özelliklerinin kalitesi iyileştirilecek, yeni Markdown export formatı eklenecek ve kullanıcılara farklı kalite/hız seçenekleri sunulacaktır.

## Glossary

- **Extension**: Chrome tarayıcısı için geliştirilmiş AI Content Exporter eklentisi
- **Export Pipeline**: İçeriğin bir formattan diğerine dönüştürülme süreci
- **Markdown**: Hafif işaretleme dili, AI platformlarının kullandığı format
- **DOCX**: Microsoft Word belge formatı (.docx uzantılı)
- **PDF**: Portable Document Format, evrensel belge formatı
- **LaTeX**: Matematiksel formüller için kullanılan işaretleme dili
- **Content Script**: Chrome extension'ın web sayfalarında çalışan JavaScript kodu
- **AI Platform**: ChatGPT, Claude, Gemini veya DeepSeek gibi yapay zeka sohbet platformları
- **Clean Text**: Markdown işaretleri temizlenmiş düz metin

## Requirements

### Requirement 1: Markdown Export

**User Story:** Bir geliştirici olarak, AI yanıtlarını markdown formatında export edebilmek istiyorum, böylece GitHub, Notion veya diğer markdown destekleyen platformlarda kullanabilirim.

#### Acceptance Criteria

1. WHEN kullanıcı "MD İndir" butonuna tıkladığında THEN Extension SHALL AI yanıtını markdown formatında (.md uzantılı) dosya olarak indirecek
2. WHEN markdown export yapıldığında THEN Extension SHALL kod bloklarını syntax highlighting bilgisi ile koruyacak (```language formatında)
3. WHEN markdown export yapıldığında THEN Extension SHALL LaTeX formüllerini orijinal formatında koruyacak ($...$ ve $...$ formatında)
4. WHEN markdown export yapıldığında THEN Extension SHALL tablo formatını GitHub Flavored Markdown (GFM) standardına uygun şekilde koruyacak
5. WHEN markdown export yapıldığında THEN Extension SHALL platform-specific başlıkları kaldıracak (örn: "ChatGPT said:", "Claude said:")

### Requirement 2: DOCX Export Quality Enhancement

**User Story:** Bir kullanıcı olarak, DOCX export kalitesinin yüksek olmasını istiyorum, böylece profesyonel dokümanlarda kullanabilirim.

#### Acceptance Criteria

1. WHEN DOCX export yapıldığında THEN Extension SHALL matematiksel formülleri Word'ün native equation formatına dönüştürecek
2. WHEN DOCX export yapıldığında THEN Extension SHALL kod bloklarını syntax highlighting ile renklendirecek ve monospace font kullanacak
3. WHEN DOCX export yapıldığında THEN Extension SHALL tabloları Word native table formatına dönüştürecek ve cell styling uygulayacak (borders, background)
4. WHEN DOCX export yapıldığında THEN Extension SHALL başlıkları (h1-h6) Word heading stillerine dönüştürecek ve otomatik numbering ekleyecek
5. WHEN DOCX export yapıldığında THEN Extension SHALL Unicode matematik sembollerini LaTeX komutlarına normalize edecek
6. WHEN DOCX export yapıldığında THEN Extension SHALL custom fonts embed edecek (kod blokları için Source Code Pro)
7. WHEN DOCX export yapıldığında THEN Extension SHALL sayfa numarası ve tarih içeren header/footer ekleyecek

### Requirement 3: PDF Export Quality Options

**User Story:** Bir kullanıcı olarak, PDF export için kalite ve hız arasında seçim yapabilmek istiyorum, böylece ihtiyacıma göre optimize edilmiş çıktı alabilirim.

#### Acceptance Criteria

1. WHEN kullanıcı PDF export başlattığında THEN Extension SHALL iki seçenek sunacak: "Hızlı PDF" ve "Kaliteli PDF"
2. WHEN kullanıcı "Hızlı PDF" seçeneğini seçtiğinde THEN Extension SHALL HTML-to-PDF pipeline kullanarak 5 saniye içinde PDF oluşturacak
3. WHEN kullanıcı "Kaliteli PDF" seçeneğini seçtiğinde THEN Extension SHALL gelişmiş rendering pipeline kullanarak yüksek kaliteli PDF oluşturacak
4. WHEN "Hızlı PDF" oluşturulduğunda THEN Extension SHALL KaTeX ile render edilmiş matematiksel formülleri içerecek
5. WHEN "Kaliteli PDF" oluşturulduğunda THEN Extension SHALL custom fonts embed edecek (Roboto, Source Code Pro)
6. WHEN "Kaliteli PDF" oluşturulduğunda THEN Extension SHALL kod bloklarını syntax highlighting ile yüksek çözünürlükte render edecek
7. WHEN "Kaliteli PDF" oluşturulduğunda THEN Extension SHALL sayfa numarası, tarih ve başlık içeren header/footer ekleyecek
8. WHEN "Kaliteli PDF" oluşturulduğunda THEN Extension SHALL tabloları optimize edilmiş layout ile render edecek (auto column width)
9. WHEN "Kaliteli PDF" oluşturulduğunda THEN Extension SHALL page breaks'i akıllıca yerleştirecek (başlıkları bölmeyecek)

### Requirement 4: Export Settings Persistence

**User Story:** Bir kullanıcı olarak, export ayarlarımın kaydedilmesini istiyorum, böylece her seferinde yeniden ayarlamak zorunda kalmam.

#### Acceptance Criteria

1. WHEN kullanıcı export ayarlarını değiştirdiğinde THEN Extension SHALL ayarları Chrome storage API ile kaydedecek
2. WHEN Extension yüklendiğinde THEN Extension SHALL kaydedilmiş ayarları Chrome storage'dan okuyacak
3. WHEN kullanıcı "Varsayılana Dön" butonuna tıkladığında THEN Extension SHALL tüm ayarları fabrika ayarlarına sıfırlayacak
4. WHEN ayarlar kaydedildiğinde THEN Extension SHALL kullanıcıya görsel feedback gösterecek (örn: "Ayarlar kaydedildi" mesajı)

### Requirement 5: Error Handling and User Feedback

**User Story:** Bir kullanıcı olarak, export işlemi sırasında hata oluştuğunda ne olduğunu anlamak istiyorum, böylece sorunu çözebilirim.

#### Acceptance Criteria

1. WHEN export işlemi başarısız olduğunda THEN Extension SHALL kullanıcıya anlaşılır hata mesajı gösterecek
2. WHEN LaTeX formülü parse edilemediğinde THEN Extension SHALL formülü kod bloğu olarak gösterecek ve devam edecek
3. WHEN içerik çok büyük olduğunda (>10MB) THEN Extension SHALL kullanıcıyı uyaracak ve işleme devam etmek isteyip istemediğini soracak
4. WHEN export işlemi devam ederken THEN Extension SHALL progress indicator gösterecek
5. WHEN export başarılı olduğunda THEN Extension SHALL kullanıcıya başarı mesajı gösterecek (örn: "PDF indirildi")

### Requirement 6: Performance Optimization

**User Story:** Bir geliştirici olarak, export işlemlerinin performanslı olmasını istiyorum, böylece kullanıcı deneyimi olumsuz etkilenmesin.

#### Acceptance Criteria

1. WHEN markdown export yapıldığında THEN Extension SHALL işlemi 1 saniye içinde tamamlayacak
2. WHEN DOCX export yapıldığında THEN Extension SHALL işlemi 3 saniye içinde tamamlayacak (orta boyutlu içerik için ~50KB)
3. WHEN "Hızlı PDF" export yapıldığında THEN Extension SHALL işlemi 5 saniye içinde tamamlayacak
4. WHEN büyük içerik export edildiğinde (>100KB) THEN Extension SHALL işlemi Web Worker'da çalıştırarak UI'ı bloke etmeyecek
5. WHEN export işlemi devam ederken THEN Extension SHALL kullanıcının diğer butonlara tıklamasını engelleyecek (disabled state)

### Requirement 7: Cross-Platform Compatibility

**User Story:** Bir kullanıcı olarak, tüm desteklenen AI platformlarında aynı kalitede export alabilmek istiyorum.

#### Acceptance Criteria

1. WHEN ChatGPT'de export yapıldığında THEN Extension SHALL kod bloklarını ve LaTeX formüllerini doğru şekilde çıkaracak
2. WHEN Claude'da export yapıldığında THEN Extension SHALL kod bloklarını ve LaTeX formüllerini doğru şekilde çıkaracak
3. WHEN Gemini'de export yapıldığında THEN Extension SHALL kod bloklarını ve LaTeX formüllerini doğru şekilde çıkaracak
4. WHEN DeepSeek'te export yapıldığında THEN Extension SHALL kod bloklarını ve LaTeX formüllerini doğru şekilde çıkaracak
5. WHEN herhangi bir platformda export yapıldığında THEN Extension SHALL platform-specific UI elementlerini (butonlar, avatarlar) içeriğe dahil etmeyecek

### Requirement 8: Advanced Rendering Pipeline

**User Story:** Bir geliştirici olarak, export kalitesini artırmak için gelişmiş rendering teknikleri kullanmak istiyorum, böylece profesyonel seviyede çıktılar üretebilirim.

#### Acceptance Criteria

1. WHEN kod bloğu render edildiğinde THEN Extension SHALL highlight.js veya prism.js kullanarak syntax highlighting uygulayacak
2. WHEN LaTeX formülü render edildiğinde THEN Extension SHALL KaTeX kullanarak yüksek kaliteli matematiksel gösterim sağlayacak
3. WHEN tablo render edildiğinde THEN Extension SHALL column width'i içeriğe göre otomatik optimize edecek
4. WHEN görsel içerik varsa THEN Extension SHALL görselleri base64 olarak embed edecek veya external link olarak koruyacak
5. WHEN uzun içerik export edildiğinde THEN Extension SHALL içindekiler tablosu (Table of Contents) oluşturacak
6. WHEN PDF render edildiğinde THEN Extension SHALL 300 DPI veya üzeri çözünürlük kullanacak
7. WHEN DOCX render edildiğinde THEN Extension SHALL Word 2016+ uyumlu stil şablonları kullanacak

### Requirement 9: Export Format Validation

**User Story:** Bir geliştirici olarak, export edilen dosyaların format standartlarına uygun olmasını istiyorum, böylece diğer uygulamalarda sorunsuz açılabilsin.

#### Acceptance Criteria

1. WHEN DOCX dosyası oluşturulduğunda THEN Extension SHALL Office Open XML standardına uygun dosya üretecek
2. WHEN PDF dosyası oluşturulduğunda THEN Extension SHALL PDF 1.4 veya üzeri standarda uygun dosya üretecek
3. WHEN Markdown dosyası oluşturulduğunda THEN Extension SHALL GitHub Flavored Markdown (GFM) standardına uygun dosya üretecek
4. WHEN dosya adı oluşturulduğunda THEN Extension SHALL geçerli dosya adı karakterleri kullanacak (özel karakterlerden kaçınacak)
5. WHEN dosya oluşturulduğunda THEN Extension SHALL UTF-8 encoding kullanacak

### Requirement 10: Library Selection and Integration

**User Story:** Bir geliştirici olarak, en uygun kütüphaneleri seçmek istiyorum, böylece kalite ve performans dengesini sağlayabilirim.

#### Acceptance Criteria

1. WHEN DOCX oluşturulduğunda THEN Extension SHALL @m2d/core veya docx kütüphanesini kullanacak
2. WHEN PDF oluşturulduğunda THEN Extension SHALL pdfmake veya jsPDF+autotable kombinasyonunu kullanacak
3. WHEN syntax highlighting yapıldığında THEN Extension SHALL highlight.js veya prism.js kullanacak
4. WHEN markdown parse edildiğinde THEN Extension SHALL markdown-it veya remark kullanacak
5. WHEN LaTeX render edildiğinde THEN Extension SHALL KaTeX kullanacak (MathJax'tan daha hızlı)
6. WHEN kütüphane seçildiğinde THEN Extension SHALL bundle size'ı minimize etmek için tree-shaking uygulayacak
7. WHEN kütüphane yüklendiğinde THEN Extension SHALL lazy loading kullanarak initial load time'ı azaltacak
