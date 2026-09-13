const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Never watch/crawl agent skills: installing one mid-session
// changes the tree under Metro and can crash the file watcher.
const prev = config.resolver.blockList;
const list = Array.isArray(prev) ? prev : prev ? [prev] : [];
config.resolver.blockList = [...list, /\.agents\/.*/];

module.exports = config;
