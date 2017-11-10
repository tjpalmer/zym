let prod = process.argv.indexOf('-p') >= 0;
let webpack = require('webpack');

module.exports = {
  devServer: {
    hot: false,
    inline: false,
  },
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
        test: /\.css$/,
        loader: ['style-loader', 'css-loader'],
      }, {
        // Take out all but woff from font-awesome.
        test: /font-awesome\.css/,
        loader: 'string-replace-loader',
        query: {
          multiple: [
            {
              // Remove the standalone eot.
              flags: '',
              search: 'src: url[(][^)]+webfont\.eot[^)]+[)];',
              replace: '',
            },
            {
              // Remove all but woff2 from the list.
              flags: 'g',
              search:
                // This gets '\' -> '/', so use '[...]' instead.
                'url[(][^)]+webfont[.](eot|svg|ttf|woff)[?][^)]+[)] *' +
                'format[(][^)]+[)],?',
              replace: '',
            },
            {
              // Remove the comma after woff2.
              flags: '',
              search: ', *;',
              replace: ';',
            },
          ],
        },
      }, {
        test: /\.html$/,
        loader: 'html-loader',
      }, {
        test: /\.json$/,
        loader: 'json-loader',
      }, {
        test: /\.png$/,
        loader: 'url-loader',
      }, {
        test: /\.ts$/,
        loader: 'awesome-typescript-loader',
      }, {
        test: /\.woff2/,
        loader: 'url-loader?mimetype=application/font-woff2',
      },
    ],
    // preLoaders: [
    //   {
    //     test: /\.ts$/,
    //     loader: 'tslint',
    //   },
    // ],
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      filename: 'vendor.js', name: 'vendor',
    }),
    new webpack.optimize.ModuleConcatenationPlugin(),
  ],
  resolve: {
    alias: {
      'font-awesome': 'font-awesome/css/font-awesome.css',
    },
    extensions: ['.ts', '.webpack.js', '.web.js', '.js'],
  },
  // tslint: {
  //   configuration: {
  //     rules: {
  //       curly: true,
  //       indent: [true, 'spaces'],
  //       'no-constructor-vars': true,
  //       'no-var-keyword': true,
  //       quotemark: [true, 'single', 'avoid-escape'],
  //     },
  //   },
  // },
};

if (prod) {
  module.exports.resolve.alias.three = 'three/build/three.min.js';
}
