const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

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
      chunkLoading: false,
      wasmLoading: false,
      publicPath: ''
    },
    target: 'web',
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
      }),
      new MiniCssExtractPlugin({
        filename: 'katex.css'
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
          use: [MiniCssExtractPlugin.loader, 'css-loader']
        },
        {
          test: /\.(woff|woff2|ttf|eot)$/,
          type: 'asset/resource',
          generator: {
            filename: 'fonts/[name][ext]'
          }
        }
      ]
    },
    optimization: {
      splitChunks: false,
      runtimeChunk: false,
      minimize: false,
      usedExports: false,
      sideEffects: false,
      concatenateModules: false,
      innerGraph: false,
      mangleExports: false
    },
    performance: {
      hints: false,
      maxEntrypointSize: 2048000,
      maxAssetSize: 2048000
    },
    experiments: {
      outputModule: false
    }
  }
];
