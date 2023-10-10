module.exports = {
    env: {
        browser: true,
        commonjs: true,
        es6: true,
        node: true,
    },
    parser: '@typescript-eslint/parser',
    parserOptions: {
        parser: 'babel-eslint',
        ecmaFeatures: {
            experimentalObjectRestSpread: true,
            jsx: true,
            modules: true,
        },
        ecmaVersion: 6,
        sourceType: 'module',
    },
    // extends: ["prettier"],
    extends: ['plugin:prettier/recommended'],
    plugins: ['react', 'prettier'],
    settings: {
        react: {
            version: 'detect',
        },
    },
    root: true,
    rules: {
        "prettier/prettier": [
            "error",
            {
                endOfLine: "lf",
                trailingComma: "none",
                semi: true,
            }
        ],
    }
    
}
