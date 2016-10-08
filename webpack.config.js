let prod = process.argv.indexOf('-p') >= 0;
let webpack = require('webpack');

module.exports = {
  entry: {
    app: './src/main.ts',
    vendor: [
      'font-awesome',
      'three',
    ],
  },
  output: {filename: "app.js"},
  // externals: {
  //   three: "THREE",
  // },
  module: {
    loaders: [
      {
        // Take out all but woff from font-awesome.
        test: /font-awesome/,
        loader: 'string-replace',
        query: {
          multiple: [
            {
              // Remove the standalone eot.
              flags: '',
              search: /src: url\([^)]+webfont\.eot[^)]+\);/,
              replace: '',
            },
            {
              // Remove all but woff2 from the list.
              flags: 'g',
              search:
                /url\([^)]+webfont\.(eot|svg|ttf|woff)\?[^)]+\) */.source +
                /format\([^)]+\),?/.source,
              replace: '',
            },
            {
              // Remove the comma after woff2.
              flags: '',
              search: /, *;/,
              replace: ';',
            },
          ],
        },
      }, {
        test: /\.css$/,
        loader: 'style!css',
      }, {
      //   test: /webfont\.(eot|svg|ttf|woff2)/,
      //   loader: 'ignore',
      // }, {
        test: /\.json$/,
        loader: 'json',
      }, {
        test: /\.png$/,
        loader: 'url',
      }, {
        test: /\.ts$/,
        loader: 'awesome-typescript',
      }, {
        test: /\.woff2/,
        loader: 'url?mimetype=application/font-woff2',
      },
    ],
    preLoaders: [
      {
        test: /\.ts$/,
        loader: 'tslint',
      },
    ],
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.js'),
  ],
  resolve: {
    alias: {
      'font-awesome': 'font-awesome/css/font-awesome.css',
    },
    extensions: ['', '.ts', '.webpack.js', '.web.js', '.js'],
  },
  tslint: {
    configuration: {
      rules: {
        curly: true,
        indent: [true, 'spaces'],
        'no-constructor-vars': true,
        'no-var-keyword': true,
        quotemark: [true, 'single', 'avoid-escape'],
      },
    },
  },
};

if (prod) {
  module.exports.resolve.alias.three = 'three/build/three.min.js';
}
