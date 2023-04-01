const path = require('path');
// const HtmlWebpackPlugin = require('html-webpack-plugin');

/**
 * @method resolve
 * @description 从根路径开始查找文件
 */
const resolve = (targetPath) => {
  return path.resolve(__dirname, targetPath);
};

module.exports = {
  target: 'web',
  // 入口文件
  entry: {
    main: resolve('./src/index.tsx'),
  },
  // 输出
  output: {
    // 文件名称
    filename: '[name].[contenthash].js',
    // 输出目录
    path: resolve('./dist'),
    // 每次编译输出的时候，清空dist目录 - 这里就不需要clean-webpack-plugin了
    clean: true,
    // 所有URL访问的前缀路径
    publicPath: '/',
  },
  resolve: {
    // 定义了扩展名之后，在import文件时就可以不用写后缀名了，会按循序依次查找
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json', '.css', '.less'],
    // 设置链接
    alias: {
      // 注意resolve方法开始的查找的路径是/
      '@': resolve('./src'),
    },
  },

  module: {
    rules: [
      {
        // 匹配js/jsx
        test: /\.(j|t)s(x)?$/,
        // 排除node_modules
        exclude: /node_modules/,
        use: {
          // 确定使用的loader
          loader: 'babel-loader',
          // 参数配置
          options: {
            presets: [
              [
                // 预设polyfill
                '@babel/preset-env',
                {
                  // polyfill 只加载使用的部分
                  useBuiltIns: 'usage',
                  // 使用corejs解析，模块化
                  corejs: '3',
                },
              ],
              // 解析react
              '@babel/preset-react',
              '@babel/preset-typescript',
            ],
            // 使用transform-runtime，避免全局污染，注入helper
            plugins: ['@babel/plugin-transform-runtime'],
          },
        },
      },
    ],
  },
};
