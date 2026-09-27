// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    rules: {
      // The package root re-exports every lucide icon, and Metro keeps them
      // all: importing it cost ~1,700 modules for the few dozen icons the
      // app draws. Each icon has its own entry point, so import that.
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@tamagui/lucide-icons-2',
              message:
                "Import each icon from '@tamagui/lucide-icons-2/icons/<Name>'; the package root bundles every icon.",
            },
          ],
        },
      ],
      // No barrel files: a module that re-exports others makes importing one
      // name evaluate them all, and it is how the feature folders ended up
      // importing each other in circles. Import from the file that declares
      // the name.
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ExportAllDeclaration',
          message:
            'No barrel files: import from the module that declares the name.',
        },
        {
          selector: 'ExportNamedDeclaration[source]',
          message:
            'No barrel files: import from the module that declares the name.',
        },
      ],
      'import/no-cycle': 'error',
    },
  },
]);
