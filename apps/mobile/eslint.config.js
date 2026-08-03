const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  { ignores: ['dist/**', '.expo/**', 'coverage/**'] },
  expoConfig,
  {
    rules: {
      'import/no-named-as-default': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      'react/jsx-no-leaked-render': ['error', { validStrategies: ['ternary', 'coerce'] }],
    },
  },
]);
