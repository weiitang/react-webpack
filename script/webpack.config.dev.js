/* eslint-disable no-console */
// merge，合并两个或多个webpack配置文件
const { merge } = require('webpack-merge');
const dotenv = require('dotenv');
const webpack = require('webpack');

const {
  getBrowserAuthCookies,
  fetchBrowserAuthCookies,
  hasBrowserAuthCookies,
} = require('./cookie');

const {
  createRules,
} = require('./config');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const path = require('path');

const isProd = process.env.NODE_ENV === 'prod';
const rootDir = path.resolve(__dirname);

// 导入公共配置文件
const webpackConfigBase = require('./webpack.config.base');
// 可以从 .env 文件中自动加载环境变量到 process.env 对象
dotenv.config();


const {
  PLATFORM = 'pc',
  DEST_PATH = '',
  PREVIEW_FILE = '',
  NODE_ENV,
  CACHE,
  HOST,
  PORT,
  PROXY,
  PROXY_AUTH,
  PROXY_AUTH_COOKIE,
  PROXY_AUTH_BROWSER,
  IS_APP,
  open = false,
  BACKEND_ENV,
} = process.env;
const DIST_DIR = path.resolve(rootDir, 'dist');

console.log('环境变量：', {
  PLATFORM,
  DEST_PATH,
  PREVIEW_FILE,
  NODE_ENV,
  CACHE,
  HOST,
  PORT,
  PROXY,
  PROXY_AUTH,
  PROXY_AUTH_COOKIE,
  BACKEND_ENV,
  PROXY_AUTH_BROWSER,
  IS_APP,
  open,
});

const proxy = {};
if (PROXY) {
  const items = PROXY.split(';')
    .filter(Boolean)
    .map((item) => item.trim());
  const authItems = PROXY_AUTH.split(';')
    .filter(Boolean)
    .map((item) => item.trim());
  items.forEach((item) => {
    const [uri, target] = item.split('->');
    const options = {
      target,
      async login(page) {
        // eslint-disable-next-line no-return-await
        return await page.click('#btn_smartlogin');
      },
      chrome: PROXY_AUTH_BROWSER ? PROXY_AUTH_BROWSER : true,
      expire: 6 * 60 * 60 * 1000,
      auto: 6 * 60 * 60 * 1000,
    };

    const isMatchVisitedTarget = authItems.some((item) => item === target);

    // 提前先拉取一次cookie
    if (isMatchVisitedTarget && !PROXY_AUTH_COOKIE && !hasBrowserAuthCookies(options)) {
      fetchBrowserAuthCookies(options);
    }

    proxy[uri] = {
      target,
      secure: false,
      changeOrigin: true,
      onProxyReq(proxyReq) {
        if (PROXY_AUTH_COOKIE) {
          proxyReq.setHeader('Cookie', PROXY_AUTH_COOKIE);
        } else if (isMatchVisitedTarget && hasBrowserAuthCookies(options)) {
          const cookies = getBrowserAuthCookies(options);
          proxyReq.setHeader('Cookie', cookies);
        }
      },
    };
  });
}

const host = HOST || '127.0.0.1';
const port = PORT || 3000;

const destPath = path.resolve(DIST_DIR, PLATFORM, DEST_PATH);
const baseUri = DEST_PATH ? `/${DEST_PATH}` : '/';
const publicPath = DEST_PATH ? `${baseUri}/` : '/';
const previewSourceDir = IS_APP ? path.dirname(PREVIEW_FILE) : path.resolve(__dirname, 'platforms', PLATFORM);
const entry = path.resolve(previewSourceDir, IS_APP ? 'index.ts' : 'index.js');
const template = path.resolve(previewSourceDir, 'index.html');
const directory = DEST_PATH ? path.resolve(DIST_DIR, PLATFORM) : destPath; // 当存在destPath时，我们要以顶层目录作为服务根目录，这样才能通过destPath访问到应用

console.log('输入输出：', {
  proxy,
  entry,
  template,
  destPath,
  publicPath,
  baseUri,
  host,
  port,
  directory,
});

// eslint-disable-next-line no-unused-vars
const rules = createRules(entry, {
  include: [path.dirname(entry), path.dirname(PREVIEW_FILE)],
  style: true,
  hot: true,
});

// dev环境下相关配置
module.exports = merge(webpackConfigBase, {
  // 指定环境
  mode: 'none',
  // 输出source-map的方式，增加调试。eval是默认推荐的选择，build fast and rebuild fast！
  // devtool: 'eval',
  devtool: 'cheap-module-source-map',
  // 本地服务器配置
  devServer: {
    // // 启动GZIP压缩
    // compress: true,
    // // 设置端口号
    // port: 3000,
    // // 代理请求设置
    // proxy: {
    //   '/api': {
    //     // 目标域名
    //     target: 'https://tim3dev.woa.com',
    //     // 允许跨域了
    //     changeOrigin: true,
    //     // 重写路径 - 根据自己的实际需要处理，不需要直接忽略该项设置即可
    //     // pathRewrite: {
    //     //   // 该处理是代码中使用/api开头的请求，如/api/userinfo，实际转发对应服务器的路径是/userinfo
    //     //   '^/api': '',
    //     // },
    //     // https服务的地址，忽略证书相关
    //     secure: false,
    //   },
    // },

    hot: true,
    liveReload: false,
    host,
    port,
    proxy,
    open,
    compress: true,
    static: {
      directory,
      serveIndex: true,
    },
    historyApiFallback: DEST_PATH
      ? {
          rewrites: [
            // 重定向到给定的目标地址
            {
              from: new RegExp(`^${createSafeExp(publicPath)}`),
              to: `${publicPath}index.html`,
            },
          ],
        }
      : true,
    headers: BACKEND_ENV
      ? {
          'Set-Cookie': `__env=${BACKEND_ENV}; path=/`,
        }
      // eslint-disable-next-line no-undefined
      : undefined,

  },
  plugins: [
    // new webpack.ProvidePlugin({
    //   process: 'process',
    //   // Buffer: ['buffer', 'Buffer'],
    // }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../public/index.html')
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
  // rules
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
