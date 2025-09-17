const createExpoWebpackConfigAsync = require("@expo/webpack-config");

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      babel: {
        dangerouslyAddModulePathsToTranspile: ["@supabase/supabase-js"],
      },
    },
    argv
  );

  // Add polyfills for Node.js modules
  config.resolve.fallback = {
    ...config.resolve.fallback,
    crypto: require.resolve("crypto-browserify"),
    buffer: require.resolve("buffer"),
    stream: require.resolve("stream-browserify"),
    process: require.resolve("process/browser"),
    util: require.resolve("util"),
    url: require.resolve("url"),
    assert: require.resolve("assert"),
    http: require.resolve("stream-http"),
    https: require.resolve("https-browserify"),
    os: require.resolve("os-browserify/browser"),
    path: require.resolve("path-browserify"),
    vm: require.resolve("vm-browserify"),
    fs: false,
  };

  // Add aliases for React Native Paper icons
  config.resolve.alias = {
    ...config.resolve.alias,
    "@react-native-vector-icons/material-design-icons":
      "@expo/vector-icons/MaterialCommunityIcons",
  };

  // Provide polyfills
  config.plugins.push(
    new (require("webpack").ProvidePlugin)({
      Buffer: ["buffer", "Buffer"],
      process: "process/browser",
    })
  );

  return config;
};
