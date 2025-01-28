const webpack = require("webpack");

module.exports = {
  webpack: {
    configure: {
      resolve: {
        fallback: {
          url: require.resolve("url/"),
          https: require.resolve("https-browserify"),
          http: require.resolve("stream-http"),
          util: require.resolve("util/"),
          buffer: require.resolve("buffer/"),
          stream: require.resolve("stream-browserify"),
          assert: require.resolve("assert/"),
          crypto: require.resolve("crypto-browserify"),
          events: require.resolve("events/"),
          process: require.resolve("process/browser"),
          os: require.resolve("os-browserify/browser"),
          zlib: require.resolve("browserify-zlib"),
        },
      },
      plugins: [
        new webpack.ProvidePlugin({
          process: "process/browser",
          Buffer: ["buffer", "Buffer"],
        }),
      ],
    },
  },
};
