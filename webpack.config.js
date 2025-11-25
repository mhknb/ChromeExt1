const path = require('path');
const webpack = require('webpack');

module.exports = [
  // DOCX Converter Bundle
  {
    mode: 'production',
    entry: './src/docx-wrapper.js',
    output: {
      filename: 'docx-converter-bundled.js',
      path: path.resolve(__dirname, 'lib'),
      library: 'DocxConverterBundled',
      libraryTarget: 'window',
      libraryExport: 'default'
    },
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
        {
          test: /\.(woff|woff2|ttf|eot)$/,
          type: 'asset/resource',
          generator: {
            filename: 'fonts/[name][ext]'
          }
        }
      ]
    }
  },
  // PDF Converter Bundle
  {
    mode: 'production',
    entry: './src/pdf-wrapper.js',
    output: {
      filename: 'pdf-converter-bundled.js',
      path: path.resolve(__dirname, 'lib'),
      library: 'PdfConverterBundled',
      libraryTarget: 'window',
      libraryExport: 'default',
      // Ensure clean UTF-8 output
      charset: true
    },
    resolve: {
      extensions: ['.js', '.mjs'],
      fallback: {
        "buffer": false,
        "stream": false,
        "path": false,
        "util": false,
        "process": false,
        "fs": false,
        "crypto": false
      }
    },
    plugins: [
      // Removed ProvidePlugin to avoid binary data
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
        }
      ]
    },
    // Disable source maps and other features that might add binary data
    devtool: false,
    optimization: {
      minimize: true,
      // Ensure no binary data in runtime
      runtimeChunk: false
    }
  }
];
