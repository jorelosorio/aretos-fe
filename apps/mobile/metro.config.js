const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// The local database's migrations are `.sql` files, inlined by the Babel
// plugin in `babel.config.js`; Metro has to resolve them first.
config.resolver.sourceExts.push('sql');

module.exports = config;
