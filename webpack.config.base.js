import path from "path";

export default {
  module: {
    loaders: [{
      test: /\.jsx?$/,
      loaders: ["babel-loader"],
      exclude: /node_modules/
    }, {
      test: /\.json$/,
      loader: "json-loader"
    }, {
      test: /\.(woff|woff2|eot|ttf|png|jpg|gif)$/,
      loader: "url-loader?limit=100000"
    }]
  },
  output: {
    path: path.join(__dirname, "dist"),
    filename: "[name].js",
    libraryTarget: "commonjs2"
  },
  resolve: {
    extensions: ["", ".js", ".jsx"],
    packageMains: ["webpack", "browser", "web", "browserify", ["jam", "main"], "main"],
    modulesDirectories: ["node_modules", "app/node_modules"]
  },
  plugins: [

  ],
  externals: [
    // put your node 3rd party libraries which can't be built with webpack here
    // (mysql, mongodb, and so on..)
  ]
};
