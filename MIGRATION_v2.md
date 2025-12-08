# Migration Guide: v1.x to v2.0

This guide helps you migrate from AI Content Exporter v1.x to v2.0.

## Overview

Version 2.0 is a major update that introduces new export formats, enhanced quality, and improved performance. While the core functionality remains the same, there are several new features and improvements.

## What's New in v2.0

### New Export Formats
- **Markdown Export**: New `.md` format with GitHub Flavored Markdown support
- **Two-Tier PDF**: Choose between Fast PDF (5 seconds) or Quality PDF (professional)

### Enhanced Quality
- **Syntax Highlighting**: Code blocks now have professional syntax highlighting
- **LaTeX Support**: Mathematical formulas are properly rendered
- **Better DOCX**: Custom fonts, headers/footers, and professional styling
- **Better PDF**: Custom fonts, intelligent page breaks, and table of contents

### Performance Improvements
- **Web Workers**: Large content (>100KB) no longer blocks the UI
- **Lazy Loading**: Faster initial load time
- **Caching**: Improved performance for repeated exports

## Breaking Changes

### None!
Version 2.0 is fully backward compatible. All your existing workflows will continue to work.

## New Features You Should Try

### 1. Markdown Export
Perfect for GitHub, Notion, or Obsidian:
```
1. Click extension icon
2. Select "MD İndir"
3. Get GitHub-compatible markdown file
```

**Benefits**:
- Code blocks with language syntax preserved
- LaTeX formulas in original format
- GFM-compliant tables
- No platform headers

### 2. Quality PDF Export
For professional documentation:
```
1. Click extension icon
2. Select "PDF İndir (Kaliteli)"
3. Get professional-quality PDF
```

**Features**:
- Custom fonts (Roboto, Source Code Pro)
- Syntax-highlighted code blocks
- Header/footer with page numbers
- Intelligent page breaks
- Auto-generated table of contents (for long content)

### 3. Enhanced DOCX Export
Your existing DOCX exports are now better:
- Syntax-highlighted code blocks
- LaTeX formulas as Word equations
- Professional table styling
- Header/footer with page numbers

## Settings Migration

Your existing settings will be automatically migrated. No action needed!

### New Settings Available
- **PDF Quality Preference**: Choose default between Fast or Quality
- **Font Embedding**: Enable/disable custom fonts
- **Header/Footer**: Customize page headers and footers

Access settings by clicking the extension icon and selecting "Settings".

## Performance Considerations

### Large Content
If you're exporting large conversations (>100KB):
- v2.0 uses Web Workers to prevent UI blocking
- You'll see a progress indicator during export
- Export may take a few seconds longer for better quality

### Initial Load
- First time using a new export format may take slightly longer (lazy loading)
- Subsequent exports will be faster (caching)

## Troubleshooting

### "Export taking too long"
- For quick exports, use "Hızlı PDF" instead of "Kaliteli PDF"
- Markdown export is the fastest option (~1 second)

### "DOCX looks different"
- v2.0 uses enhanced styling for better quality
- If you prefer the old style, you can adjust settings
- All content is preserved, only styling is improved

### "New buttons confusing"
- "MD İndir" = Markdown export (new!)
- "DOCX İndir" = Enhanced DOCX (improved)
- "PDF İndir (Hızlı)" = Fast PDF (~5 seconds)
- "PDF İndir (Kaliteli)" = Quality PDF (professional)

## Rollback (If Needed)

If you need to rollback to v1.x:
1. Go to `chrome://extensions/`
2. Find "AI Content Exporter"
3. Click "Remove"
4. Install v1.x from backup or Chrome Web Store

**Note**: We recommend trying v2.0 for a few days before rolling back. Most users find the new features valuable.

## Getting Help

### Documentation
- [README.md](README.md) - Full feature documentation
- [CHANGELOG.md](CHANGELOG.md) - Detailed version history

### Support
- [GitHub Issues](https://github.com/your-username/ai-content-exporter/issues) - Report bugs or request features
- [Discussions](https://github.com/your-username/ai-content-exporter/discussions) - Ask questions

## Feedback

We'd love to hear your feedback on v2.0!
- What features do you use most?
- What could be improved?
- Any bugs or issues?

Please share your thoughts in [GitHub Discussions](https://github.com/your-username/ai-content-exporter/discussions).

## Thank You!

Thank you for using AI Content Exporter. We hope v2.0 makes your AI workflow even better! 🎉
