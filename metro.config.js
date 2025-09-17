const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Add support for path aliases
config.resolver.alias = {
  "@": "./src",
  "@/components": "./src/components",
  "@/screens": "./src/screens",
  "@/services": "./src/services",
  "@/types": "./src/types",
  "@/utils": "./src/utils",
  "@/hooks": "./src/hooks",
  "@/constants": "./src/constants",
  "@/navigation": "./src/navigation",
  crypto: "crypto-browserify",
};

// Add polyfills for web
config.resolver.platforms = ["ios", "android", "web"];

// Add node modules support
config.resolver.nodeModulesPaths = [
  require("path").resolve(__dirname, "node_modules"),
];

module.exports = config;
