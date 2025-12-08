const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

const commonConfig = {
  mode: 'production',
  resolve: {
    extensions: ['.js', '.mjs'],
    fallback: {
      "buffer": require.resolve("buffer/"),
      "stream": require.resolve("stream-browserify"),
      "path": require.resolve("path-browserify"),
      "util": require.resolve("util/"),
      "process": require.resolve("process/browser"),
      "fs": false,
      "crypto": false
    }
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    })
  ],
  module: {
    rules: [
      {
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      // Inline font files as base64 data URLs to avoid external file loading
      // This is required for Chrome extension executeScript compatibility
      {
        test: /\.(woff|woff2|ttf|eot)$/,
        type: 'asset/inline'
      }
    ]
  },
  // Enable tree-shaking for unused code
  optimization: {
    usedExports: true,
    sideEffects: false,
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: false, // Keep console for debugging
            drop_debugger: true,
            pure_funcs: ['console.debug'], // Remove debug logs
          },
          mangle: true,
          format: {
            comments: false, // Remove comments
          },
        },
        extractComments: false,
      }),
    ],
    // Code splitting configuration
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // Vendor libraries shared across bundles
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10,
          reuseExistingChunk: true,
        },
        // Syntax highlighting shared module
        highlighter: {
          test: /[\\/]node_modules[\\/]highlight\.js[\\/]/,
          name: 'highlighter',
          priority: 20,
          reuseExistingChunk: true,
        },
        // KaTeX shared module
        katex: {
          test: /[\\/]node_modules[\\/]katex[\\/]/,
          name: 'katex',
          priority: 20,
          reuseExistingChunk: true,
        },
        // PDFMake shared module
        pdfmake: {
          test: /[\\/]node_modules[\\/]pdfmake[\\/]/,
          name: 'pdfmake',
          priority: 20,
          reuseExistingChunk: true,
        },
        // Common utilities shared across exporters
        common: {
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true,
        },
      },
    },
  },
  // Performance hints
  performance: {
    hints: 'warning',
    maxEntrypointSize: 512000, // 500KB
    maxAssetSize: 512000,
  },
};

module.exports = [
  // DOCX Converter Bundle (Enhanced)
  {
    ...commonConfig,
    name: 'docx-converter',
    entry: {
      'docx-converter': './src/docx-wrapper.js',
    },
    output: {
      filename: '[name]-bundled.js',
      path: path.resolve(__dirname, 'lib'),
      library: {
        name: 'DocxConverterBundled',
        type: 'umd',
        umdNamedDefine: true
      },
      globalObject: 'window',
      clean: false, // Don't clean lib folder (other bundles exist)
    },
    // DOCX-specific optimizations
    optimization: {
      ...commonConfig.optimization,
      splitChunks: {
        ...commonConfig.optimization.splitChunks,
        cacheGroups: {
          ...commonConfig.optimization.splitChunks.cacheGroups,
          // DOCX-specific dependencies
          docxCore: {
            test: /[\\/]node_modules[\\/](@m2d|mdast2docx)[\\/]/,
            name: 'docx-core',
            priority: 25,
            reuseExistingChunk: true,
          },
        },
      },
    },
  },

  // PDF Converter Bundle (Fast - HTML2PDF)
  {
    ...commonConfig,
    name: 'pdf-converter-fast',
    entry: {
      'pdf-converter': './src/pdf-wrapper.js',
    },
    output: {
      filename: '[name]-bundled.js',
      path: path.resolve(__dirname, 'lib'),
      library: {
        name: 'PdfConverterBundled',
        type: 'window',
      },
      globalObject: 'window',
      clean: false,
    },
    // Disable code splitting - Chrome extension executeScript has issues with
    // bundled binary data (fonts) in separate chunks
    optimization: {
      ...commonConfig.optimization,
      splitChunks: false,
    },
  },

  // Markdown Exporter Bundle
  {
    ...commonConfig,
    name: 'markdown-exporter',
    entry: {
      'markdown-exporter': './src/markdown-exporter.js',
    },
    output: {
      filename: '[name]-bundled.js',
      path: path.resolve(__dirname, 'lib'),
      library: {
        name: 'MarkdownExporter',
        type: 'umd',
        umdNamedDefine: true
      },
      globalObject: 'window',
      clean: false,
    },
    // Markdown-specific optimizations
    optimization: {
      ...commonConfig.optimization,
      splitChunks: {
        ...commonConfig.optimization.splitChunks,
        cacheGroups: {
          ...commonConfig.optimization.splitChunks.cacheGroups,
          // Markdown processing dependencies
          markdown: {
            test: /[\\/]node_modules[\\/](marked|turndown|remark|unified)[\\/]/,
            name: 'markdown-libs',
            priority: 25,
            reuseExistingChunk: true,
          },
        },
      },
    },
  },

  // PDF Quality Exporter Bundle (PDFMake)
  {
    ...commonConfig,
    name: 'pdf-quality-exporter',
    entry: {
      'pdf-quality-exporter': './src/pdf-quality-exporter.js',
    },
    output: {
      filename: '[name]-bundled.js',
      path: path.resolve(__dirname, 'lib'),
      library: {
        name: 'PdfQualityExporter',
        type: 'window',
      },
      globalObject: 'window',
      clean: false,
    },
    // Disable code splitting - Chrome extension executeScript has issues with
    // bundled binary data (fonts) in separate chunks
    optimization: {
      ...commonConfig.optimization,
      splitChunks: false,
    },
  },

  // DOCX Exporter Enhanced (New entry point for enhanced version)
  {
    ...commonConfig,
    name: 'docx-exporter-enhanced',
    entry: {
      'docx-exporter-enhanced': './src/docx-exporter-enhanced.js',
    },
    output: {
      filename: '[name]-bundled.js',
      path: path.resolve(__dirname, 'lib'),
      library: {
        name: 'DocxExporterEnhanced',
        type: 'umd',
        umdNamedDefine: true
      },
      globalObject: 'window',
      clean: false,
    },
    optimization: {
      ...commonConfig.optimization,
      splitChunks: {
        ...commonConfig.optimization.splitChunks,
        cacheGroups: {
          ...commonConfig.optimization.splitChunks.cacheGroups,
          docxCore: {
            test: /[\\/]node_modules[\\/](@m2d|mdast2docx)[\\/]/,
            name: 'docx-core',
            priority: 25,
            reuseExistingChunk: true,
          },
        },
      },
    },
  },
];
