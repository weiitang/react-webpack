const dirname = __dirname;
const path = require('path');
const globby = require('globby');
const fs = require('fs');

const config = {
	rootPath: dirname,
	includePath: ['./src/modules/**'],
  excludePath: ['**/_i18n', '**/*.xlsx',],
  fileType: ['.js', '.jsx', '.ts', '.tsx', '.html'],
  i18nStorePath: path.resolve(dirname, './i18n-store'),
  i18nConfigPath: path.resolve(dirname, './src/i18n-config'),
	angularFilterName: 'i18next2',
	i18nDataSource: 'json',
	i18nObject: '$i18next',
  i18nMethod: 't',
  i18nObjectPath: '@src/i18n',
	excludeFunc: ['dayjs.format', 'I18n.t', 'i18n.t2', 'i18n.t', 'history.push', 'console.log', 'date.format', 'moment.format'],
	separator: ':',
	logDir: `${dirname}/logs`,
  autoCompleteImport: true,
}

module.exports = config;