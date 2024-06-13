/** @format */

module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    parser: 'babel-eslint',
    ecmaFeatures: {
      experimentalObjectRestSpread: true,
      jsx: true,
      modules: true
    },
    ecmaVersion: 6,
    sourceType: 'module'
  },
  // extends: ["prettier"],
  extends: ['plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended',],
  // extends: ['plugin:prettier/recommended'],
  plugins: ['react', '@typescript-eslint', 'prettier'],
  settings: {
    react: {
      version: 'detect'
    }
  },
  root: true,
  rules: {
    // 'prettier/prettier': 2,
//     'chalk/chalk': 'off',
//     '@typescript-eslint/member-ordering': 'off',
//     'import/order': ["error"],
//     '@typescript-eslint/no-misused-promises': 'off',
    'no-console': ['error', { allow: ['warn', 'error', 'debug'] }],
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    "@typescript-eslint/ban-ts-comment": "off",
    '@typescript-eslint/ban-types': 'off'
    // 'import/order': ["error"],
//     // 命名规则
//     '@typescript-eslint/naming-convention': [
//       'error',
//       {
//         selector: 'default',
//         format: ['camelCase'],
//       },
//       {
//         selector: 'variable',
//         modifiers: ['const'],
//         format: ['UPPER_CASE', 'PascalCase', 'camelCase'],
//       },
//       {
//         selector: ['enum', 'enumMember'],
//         format: ['UPPER_CASE', 'PascalCase', 'camelCase'],
//       },
//       {
//         selector: 'typeLike',
//         format: ['PascalCase', 'camelCase'],
//       },
//       {
//         selector: 'memberLike',
//         format: ['camelCase', 'snake_case', 'PascalCase'],
//         leadingUnderscore: 'allow',
//       },
//       {
//         selector: 'property',
//         format: ['camelCase', 'snake_case', 'PascalCase', 'UPPER_CASE'],
//         leadingUnderscore: 'allow',
//       },
//       {
//         selector: 'parameter',
//         format: ['camelCase', 'PascalCase'],
//         leadingUnderscore: 'allow',
//       },
//       {
//         selector: 'function',
//         format: ['camelCase', 'PascalCase'],
//       },
//       // 中文属性不检查
//       {
//         selector: 'property',
//         filter: {
//           regex: '[\\u4e00-\\u9fa5]',
//           match: true,
//         },
//         format: null,
//       },
//       // 忽略单一个_
//       {
//         selector: ['variable', 'parameter', 'property'],
//         filter: {
//           regex: '^_$',
//           match: true,
//         },
//         format: null,
//       },
//       // 以_开头的属性、变量
//       {
//         selector: ['variable', 'parameter', 'property'],
//         filter: {
//           regex: '^_',
//           match: true,
//         },
//         prefix: ['_'],
//         format: ['camelCase'],
//       },
//       // 几个固定的可以使用的属性名
//       {
//         selector: 'objectLiteralProperty',
//         filter: {
//           regex: '^(is-on-drag|__html)$',
//           match: true,
//         },
//         format: null,
//       },
//     ],
  }
};
