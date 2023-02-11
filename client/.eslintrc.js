module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  overrides: [],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['react', '@typescript-eslint', 'import-newlines'],
  rules: {
    // 'max-len': ['error', 80],
    // semi: ['error', 'never'],
    // 'object-curly-newline': ['error', 'always'],
    indent: ['warn', 2],
    /*'import-newlines/enforce': [
      'error',
      {
        items: 1,
        'max-len': 80,
        semi: false,
      },
    ],
    */
  },
}
