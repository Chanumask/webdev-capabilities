import js from '@eslint/js';
import globals from 'globals';

// Lints the repo's own scripts only. Sites, examples and templates have their own toolchains.
export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      'sites/**',
      'examples/**',
      'templates/**',
      'capabilities/**',
      'exports/**',
      '.smoke/**',
      '.claude/**',
      '.impeccable/**',
    ],
  },
  js.configs.recommended,
  {
    files: ['**/*.{js,mjs}'],
    languageOptions: { ecmaVersion: 2024, sourceType: 'module', globals: { ...globals.node } },
    rules: { 'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }] },
  },
];
