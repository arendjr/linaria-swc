const path = require("path");

const linariaPlugin = require("../lib").default;

module.exports = {
  entry: "./src/index.js",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: "swc-loader",
          options: {
            plugin: linariaPlugin,
            jsc: {
              parser: {
                jsx: true,
              },
              target: "es2020",
            },
          },
        },
      },
    ],
  },
};
