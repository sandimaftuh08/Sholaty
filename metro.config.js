
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Tambahkan dukungan file WebAssembly SQLite
config.resolver.assetExts.push('wasm');

// Header untuk SQLite Web
config.server.headers = {
  'Cross-Origin-Embedder-Policy': 'credentialless',
  'Cross-Origin-Opener-Policy': 'same-origin',
};

module.exports = config;
