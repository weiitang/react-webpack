// merge，合并两个或多个webpack配置文件
const { merge } = require('webpack-merge');
const dotenv = require('dotenv');
const webpack = require('webpack');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const path = require('path');

const isProd = process.env.NODE_ENV === 'prod';

// 导入公共配置文件
const webpackConfigBase = require('./webpack.config.base');
dotenv.config();

// dev环境下相关配置
module.exports = merge(webpackConfigBase, {
  // 指定环境
  mode: 'none',
  // 输出source-map的方式，增加调试。eval是默认推荐的选择，build fast and rebuild fast！
  // devtool: 'eval',
  devtool: 'cheap-module-source-map',
  // 本地服务器配置
  devServer: {
    // 启动GZIP压缩
    compress: true,
    // 设置端口号
    port: 3000,
    // 代理请求设置
    proxy: {
      '/api': {
        // 目标域名
        target: 'https://tim3dev.woa.com',
        // 允许跨域了
        changeOrigin: true,
        // 重写路径 - 根据自己的实际需要处理，不需要直接忽略该项设置即可
        pathRewrite: {
          // 该处理是代码中使用/api开头的请求，如/api/userinfo，实际转发对应服务器的路径是/userinfo
          '^/api': '',
        },
        // https服务的地址，忽略证书相关
        secure: false,
      },
    },

  },
  plugins: [
    // new webpack.ProvidePlugin({
    //   process: 'process',
    //   // Buffer: ['buffer', 'Buffer'],
    // }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, './public/index.html')
    }),

    new MiniCssExtractPlugin({
    // 输出的每个css文件名称
    filename: isProd ? '[name].[contenthash].css' : '[name].css',
    // 非入口的chunk文件名 - 通过import()加载异步组件中样式
    chunkFilename: isProd ? '[id].[contenthash].css' : '[id].css',
    }),
    new webpack.DefinePlugin({
      'process.env': {
        ...generateEnvConsts(),
        'NODE_ENV': JSON.stringify(process.env.NODE_ENV),
        'PLATFORM': '"pc"'
      }
    })
  ],

  module: {
  rules: [
    // {
    //   test: /\.(ts|tsx)$/,
    //   exclude: /node_modules/,
    //   use: [
    //     {loader: "ts-loader"},
    //   ]
    // },
    {
      test: /\.(css|less)$/,
      use: [
        // 生产环境下直接分离打包css
        isProd ? MiniCssExtractPlugin.loader : 'style-loader',
        {
          loader: 'css-loader',
        },
        'less-loader',
        {
          loader: 'postcss-loader',
          options: {
            postcssOptions: {
              // 浏览器前缀自动补全
              plugins: ['autoprefixer'],
            },
          },
        },
      ],
    },
  ]
}
});

function generateEnvConsts() {
  const obj = {};
  const keys = Object.keys(process.env);
  keys.forEach((key) => {
    if (/^[A-Z]/.test(key)) {
      const value = process.env[key];
      obj[key] = JSON.stringify(value);
    }
  });
  return obj;
}
