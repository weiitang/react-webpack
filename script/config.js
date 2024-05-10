/* eslint-disable no-void */
/* eslint-disable no-shadow */

const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

// const alias = require('./alias');
const { include, exclude } = require('./cludes');

const extensions = ['.js', '.jsx', '.ts', '.tsx', '.esm', '.wasm', '.md'];

// 通过env PLATFORM来自动选择文件后缀，通过选择使用不同文件后缀来解决某些覆盖问题
if (process.env.PLATFORM) {
  const exts = [...extensions];
  exts.reverse();
  exts.forEach((ext) => {
    extensions.unshift(`.${process.env.PLATFORM}${ext}`);
  });
}

const rootDir = path.resolve(__dirname, '../..');
const projectDir = path.resolve(rootDir, '../..');
const env = process.env.NODE_ENV || 'development';

function createBabelConfig(entry, options = {}) {
  const { include: includes = [], exclude: excludes = [] } = options;
  const ex = [...exclude, ...excludes];
  return {
    presets: [
      ...createPolyfills(entry, options).babelPresets,
      ['@babel/preset-react', { runtime: 'automatic' }],
      '@babel/preset-typescript',
    ],
    plugins: [
      path.resolve(__dirname, '../plugins/babel-plugin-auto-css-modules.js'),
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      ['@babel/plugin-proposal-class-properties', { loose: true }],
      [
        'transform-class-remove-static-properties',
        { mode: env === 'production' ? 'remove' : 'wrap' },
      ],
    ],
    include: [...include, ...includes],
    exclude: ex.length ? ex : void 0,
    // cacheDirectory: true,
    // cacheCompression: true,
  };
}

function createRules(entry, options) {
  const {
    include: includes = [],
    exclude: excludes = [],
    style,
    css,
  } = options;
  const babelConfig = createBabelConfig(entry, options);
  const ex = [...exclude, ...excludes];
  return [
    {
      test: /\.(j|t)s(x)?$/,
      use: [
        {
          loader: 'babel-loader',
          options: babelConfig,
        },
        ...createHotModuleLoaders(entry, options),
        ...createPolyfills(entry, options).webpackLoaders,
        {
          loader: path.resolve(
            __dirname,
            '../loaders/implement-shared-loader.js'
          ),
          options: {
            abstractDir: path.resolve(projectDir, 'packages/shared'),
            implementDir: path.resolve(rootDir, 'src/@implements'),
          },
        },
      ],
      include: [...include, ...includes],
      exclude: ex.length ? ex : void 0,
    },
    {
      test: /\.css$/,
      oneOf: [
        {
          resourceQuery: /module/,
          use: createStylesheetLoaders({ module: true, style, css }),
        },
        {
          use: createStylesheetLoaders({ style, css }),
        },
      ],
    },
    {
      test: /\.(pdf)$/,
      use: [
        {
          loader: 'file-loader',
        },
      ],
    },
    {
      test: /\.less$/,
      oneOf: [
        {
          resourceQuery: /module/,
          use: createStylesheetLoaders({
            less: true,
            module: true,
            style,
            css,
          }),
        },
        {
          use: createStylesheetLoaders({ less: true, style, css }),
        },
      ],
    },
    {
      test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
      type: 'asset/resource',
    },
  ];
}

const createResolve = (app) => {
  const resolve = {
    alias: {
      // ...alias,
      // 兼容@codemirror/lang-html等使用报错
      'process/browser': require.resolve('process/browser'),
    },
    fallback: {
      process: require.resolve('process/browser'),
      path: require.resolve('path-browserify'),
      stream: require.resolve('stream-browserify'),
      util: require.resolve('util'),
      buffer: require.resolve('buffer'),
    },
    modules: [
      'node_modules',
      path.resolve(rootDir, 'node_modules'),
      path.resolve(projectDir, 'node_modules'),
    ],
    extensions,
  };
  if (app) {
    resolve.alias.app = app;
  }
  return resolve;
};

function createHotModuleLoaders(entry, options) {
  if (!options.hot) {
    return [];
  }
  const hotCode = 'if (module.hot) { module.hot.accept() }';
  return [
    {
      loader: path.resolve(__dirname, '../loaders/replace-content-loader.js'),
      options: {
        find: (request) => {
          if (!request) {
            return false;
          }
          if (entry.indexOf(request) === -1) {
            return false;
          }
          return true;
        },
        replace: (content) => content + hotCode,
      },
    },
  ];
}

function createPolyfills(entry, { corejs } = {}) {
  // 开发阶段为了追求速度，不需要polyfills
  if (env === 'development' && !corejs) {
    return {
      babelPresets: [],
      webpackLoaders: [],
    };
  }

  const presetEnvConfig = {
    modules: false,
    useBuiltIns: 'entry',
    corejs: corejs ? 3 : false,
    loose: true,
  };

  const prependText = `${
    corejs ? 'import "core-js";\n' : ''
  }import "regenerator-runtime/runtime";\n`;
  const webpackLoader = {
    loader: path.resolve(__dirname, '../loaders/replace-content-loader.js'),
    options: {
      find: (request) => request === entry,
      replace: (content) => prependText + content,
    },
  };

  return {
    babelPresets: [['@babel/preset-env', presetEnvConfig]],
    webpackLoaders: [webpackLoader],
  };
}

function createStylesheetLoaders(options = {}) {
  const sourceMapConfig = {
    sourceMap: env === 'production',
  };
  const cssLoaderModuleConfig = {
    esModule: true,
    modules: {
      localIdentName:
        env === 'production' ? '[hash:base64]' : '[path][name]__[local]',
      namedExport: true,
    },
  };
  const { module, style, less, sass, css } = options;
  const loaders = [];
  if (module) {
    loaders.unshift({
      loader: 'css-loader',
      options: {
        ...cssLoaderModuleConfig,
        ...sourceMapConfig,
      },
    });
  } else {
    loaders.unshift({
      loader: 'css-loader',
      options: {
        ...sourceMapConfig,
      },
    });
  }

  if (style) {
    loaders.unshift('style-loader');
  } else if (css) {
    loaders.unshift(MiniCssExtractPlugin.loader);
  }

  loaders.push({
    loader: 'postcss-loader',
  });

  if (less) {
    loaders.push({
      loader: 'less-loader',
      options: {
        ...sourceMapConfig,
      },
    });
  }

  if (sass) {
    loaders.push({
      loader: 'sass-loader',
      options: {
        ...sourceMapConfig,
      },
    });
  }

  if (less || sass) {
    loaders.push({
      loader: path.resolve(__dirname, '../loaders/replace-content-loader.js'),
      options: {
        replace(content) {
          return content
            .replace(/composes:(.*?) from .*?['"](.*?)['"];/gi, (_, $1, $2) => {
              const [path] = $2.split('?');
              const ext = path.split('.').pop();
              if (less && ext === 'less') {
                return `composes: ${$1.trim()} from 'less-loader!${$2}';`;
              }
              if (sass && (ext === 'sass' || ext === 'scss')) {
                return `composes: ${$1.trim()} from 'sass-loader!${$2}';`;
              }
              return _;
            })
            .replace(/:import\(["'](.*?)["']\)/gi, (_, $1) => {
              const [path] = $1.split('?');
              const ext = path.split('.').pop();
              if (less && ext === 'less') {
                return `:import('less-loader!${$1}')`;
              }
              if (sass && (ext === 'sass' || ext === 'scss')) {
                return `:import('sass-loader!${$1}')`;
              }
              return _;
            });
        },
      },
    });
  }
  return loaders;
}

module.exports = {
  createRules,
  createResolve,
};
