const webpack = require("webpack");
const path = require("path");

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.resolve = {
        ...webpackConfig.resolve,
        fallback: {
          process: path.resolve(__dirname, "node_modules/process/browser.js"),
          url: require.resolve("url/"),
          https: require.resolve("https-browserify"),
          http: require.resolve("stream-http"),
          util: require.resolve("util/"),
          buffer: require.resolve("buffer/"),
          stream: require.resolve("stream-browserify"),
          assert: require.resolve("assert/"),
          crypto: require.resolve("crypto-browserify"),
          events: require.resolve("events/"),
          os: require.resolve("os-browserify/browser"),
          zlib: require.resolve("browserify-zlib"),
        },
      };

      webpackConfig.plugins = [
        ...webpackConfig.plugins,
        new webpack.ProvidePlugin({
          process: path.resolve(__dirname, "node_modules/process/browser.js"),
          Buffer: ["buffer", "Buffer"],
        }),
      ];

      return webpackConfig;
    },
  },
};
