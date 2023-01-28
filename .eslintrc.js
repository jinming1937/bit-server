module.exports = {
  parser: '@typescript-eslint/parser',
  // extends: [
  //   'plugin:@typescript-eslint/recommended',
  // ],
  plugins: ['prettier'],
  env: {node: true},
  rules: {
    'prettier/prettier': 'error',
    // allow async-await
    'generator-star-spacing': 'off',
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    camelcase: ['error', {properties: 'never'}],
    '@typescript-eslint/ban-ts-ignore': 'off',
    '@typescript-eslint/no-var-requires': 'on',
    '@typescript-eslint/explicit-module-boundary-types': 'off', // 允许没有显式的return语句
  },
}
