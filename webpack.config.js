const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'production',
  entry: './src/docx-wrapper.js',
  output: {
    filename: 'docx-converter-bundled.js',
    path: path.resolve(__dirname, 'lib'),
    library: {
      name: 'DocxConverterBundled',
      type: 'window',
      export: 'default'
    }
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
      }
    ]
  }
};
