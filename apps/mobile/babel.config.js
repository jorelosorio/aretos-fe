// The Expo preset, plus inlining `.sql` files as strings: drizzle-kit writes
// the local database's migrations as SQL, and `src/lib/db/migrations` imports
// them so they ship inside the bundle.
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [['inline-import', { extensions: ['.sql'] }]],
  };
};
