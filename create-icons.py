#!/usr/bin/env python3
"""
Simple script to create placeholder PNG icons from SVG
Requires: pip install cairosvg
"""

try:
    import cairosvg

    sizes = [16, 48, 128]

    for size in sizes:
        cairosvg.svg2png(
            url='icons/icon.svg',
            write_to=f'icons/icon{size}.png',
            output_width=size,
            output_height=size
        )
        print(f'Created icon{size}.png')

    print('All icons created successfully!')

except ImportError:
    print('cairosvg not installed. Creating simple colored squares as placeholders...')

    from PIL import Image, ImageDraw

    sizes = [16, 48, 128]

    for size in sizes:
        # Create gradient background
        img = Image.new('RGB', (size, size), '#667eea')
        draw = ImageDraw.Draw(img)

        # Draw simple copy icon shape
        margin = size // 4
        draw.rectangle(
            [margin, margin, size - margin, size - margin],
            outline='white',
            width=max(1, size // 16)
        )

        img.save(f'icons/icon{size}.png')
        print(f'Created placeholder icon{size}.png')

    print('Placeholder icons created!')

except Exception as e:
    print(f'Error: {e}')
    print('\nManual icon creation:')
    print('1. Use https://svgtopng.com/ to convert icons/icon.svg')
    print('2. Generate 16x16, 48x48, and 128x128 PNG versions')
    print('3. Save as icons/icon16.png, icon48.png, icon128.png')
