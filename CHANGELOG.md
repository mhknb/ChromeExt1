# Changelog

All notable changes to the AI Content Exporter extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2024

### Added
- **Markdown Export**: New export format with GitHub Flavored Markdown (GFM) support
  - Code blocks with language syntax preservation (```language format)
  - LaTeX formulas in original format ($...$ and $$...$$)
  - GFM-compliant table formatting
  - Automatic platform header removal
- **Enhanced Syntax Highlighting**: Integration with highlight.js for professional code rendering
  - Support for 100+ programming languages
  - Selective language loading for optimal performance
  - Token-based rendering for DOCX and PDF
- **LaTeX Support**: KaTeX integration for mathematical formula rendering
  - HTML rendering for PDF export
  - DOCX equation rendering (OMML format)
  - Inline and block formula support
- **Two-Tier PDF Export**:
  - Fast PDF: Quick export in ~5 seconds using html2pdf.js
  - Quality PDF: Professional output using pdfmake with custom fonts
- **Advanced PDF Features** (Quality mode):
  - Custom font embedding (Roboto, Source Code Pro)
  - Header/footer with page numbers, date, and title
  - Intelligent page breaks (doesn't split headings)
  - Table of Contents generation for long content
  - Optimized table layouts with auto column width
- **Enhanced DOCX Export**:
  - Syntax-highlighted code blocks with Source Code Pro font
  - LaTeX to Word equation conversion
  - Unicode math symbol normalization
  - Professional table styling with borders and backgrounds
  - Heading style mapping (h1-h6 → Heading 1-6)
  - Header/footer with page numbers and date
- **Performance Optimizations**:
  - Web Workers for large content (>100KB) to prevent UI blocking
  - Lazy loading for PDF converter and syntax highlighter
  - Caching for parsed markdown and highlighted code
  - Button disabling during export operations
- **Settings Management**:
  - Chrome storage API integration for persistent settings
  - Settings validation and defaults
  - Reset to defaults functionality
  - Visual feedback for settings changes
- **Error Handling**:
  - Comprehensive error categorization
  - User-friendly error messages
  - Graceful degradation strategies
  - Progress indicators for long exports
- **Image Handling**:
  - Base64 embedding for DOCX/PDF
  - External link preservation for Markdown
  - Image validation
- **File Validation**:
  - DOCX format validation (Office Open XML)
  - PDF format validation (PDF 1.4+)
  - Markdown format validation (GFM)
  - Filename sanitization
  - UTF-8 encoding enforcement

### Changed
- Refactored content extraction to be more modular and platform-agnostic
- Improved platform-specific selectors for better accuracy
- Enhanced markdown processing with better LaTeX normalization
- Updated webpack configuration with code splitting and tree-shaking
- Improved table-to-markdown conversion for GFM compliance

### Technical
- Migrated to modular architecture with clear separation of concerns
- Added comprehensive test coverage (unit + property-based tests)
- Implemented lazy loading for better initial load performance
- Added Web Worker support for heavy processing
- Optimized bundle sizes with webpack tree-shaking

### Dependencies Added
- `highlight.js` ^11.11.1 - Syntax highlighting
- `katex` ^0.16.11 - LaTeX rendering
- `pdfmake` ^0.2.20 - Quality PDF generation
- `fast-check` ^4.3.0 - Property-based testing

## [1.1.0] - 2024

### Added
- Initial stable release
- Basic DOCX export functionality
- Basic PDF export functionality
- Multi-AI platform support (ChatGPT, Claude, Gemini, DeepSeek)
- Clean text copy (markdown removal)
- Floating button UI
- Basic settings management

### Features
- Copy AI responses without markdown formatting
- Export to DOCX format
- Export to PDF format
- Support for code blocks
- Support for tables
- Cross-platform compatibility

## [1.0.0] - 2024

### Added
- Initial release
- Basic content extraction
- Simple text copy functionality
- ChatGPT support

---

## Version Numbering

This project follows [Semantic Versioning](https://semver.org/):
- **MAJOR** version for incompatible API changes
- **MINOR** version for new functionality in a backwards compatible manner
- **PATCH** version for backwards compatible bug fixes

## Links
- [GitHub Repository](https://github.com/your-username/ai-content-exporter)
- [Chrome Web Store](https://chrome.google.com/webstore) (Coming soon)
- [Issue Tracker](https://github.com/your-username/ai-content-exporter/issues)
