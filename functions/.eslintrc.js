module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    'eslint-config-airbnb-base',
    'prettier',
    'eslint:recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'google',
    'plugin:jsx-a11y/recommended',
  ],
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      extends: ['typescript', 'plugin:import/typescript'],
      parserOptions: {
        project: ['./tsconfig.json'], // Specify it only for TypeScript files
      },
      parser: '@typescript-eslint/parser',
    },
  ],
  parserOptions: {
    sourceType: 'module',
  },
  ignorePatterns: [
    '/lib/**/*', // Ignore built files.
    '.eslintrc.js',
    '/test/**/*',
    '*.ts',
  ],
  plugins: ['import', 'jsx-a11y'],
  rules: {
    'no-underscore-dangle': 'off',
    'no-unused-vars': ['warn', { varsIgnorePattern: '^_', argsIgnorePattern: '^_' }],
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'max-len': [
      'warn',
      {
        code: 120,
        tabWidth: 2,
        comments: 120,
        ignoreComments: false,
        ignoreTrailingComments: true,
        ignoreUrls: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreRegExpLiterals: true,
      },
    ],
    'import/no-unresolved': 0,
    'import/extensions': 0,
    'valid-jsdoc': 0,
    'prefer-promise-reject-errors': 0,
    curly: 0,
  },
};
