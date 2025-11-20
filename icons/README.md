# İkon Oluşturma

Bu klasörde extension için gereken PNG ikonları bulunmalıdır:
- icon16.png (16x16 px)
- icon48.png (48x48 px)
- icon128.png (128x128 px)

## Otomatik Oluşturma

### Yöntem 1: Online Araçlar (En Kolay)
1. https://svgtopng.com/ adresine git
2. `icon.svg` dosyasını yükle
3. 16x16, 48x48, 128x128 boyutlarında indir
4. İkonları bu klasöre kaydet

### Yöntem 2: ImageMagick ile
```bash
convert -background none icon.svg -resize 16x16 icon16.png
convert -background none icon.svg -resize 48x48 icon48.png
convert -background none icon.svg -resize 128x128 icon128.png
```

### Yöntem 3: Python Script
```bash
pip install cairosvg
python3 create-icons.py
```

## Placeholder İkonlar

Geliştirme aşamasında, SVG ikonunu kullanarak veya basit renkli kareler oluşturarak test edebilirsiniz.

## Tasarım Notları

- Renk paleti: Gradient (#667eea → #764ba2)
- Ana ikon: Copy/clipboard simgesi
- Accent: Temizlik/parlaklık göstergesi (✨)
- Stil: Modern, minimal, flat design
