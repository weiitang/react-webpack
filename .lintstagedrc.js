const fs = require('fs');
const { ESLint } = require('eslint');
const path = require('path');


// 在package.json中配置  --project 无法指定  因为npx lint-staged时是另外的项目
// "lint-staged": {
//   "./src/**/*.{jsx,tsx,js,ts}": "eslint",
//   "./src/**/*.{tsx,ts}": "tsc --project tsconfig.lint.json --pretty --noEmit"
// },

const generateTsCheck = (platform) => (files) => {
  try {
    const stagedFiles = files.filter(file => file.indexOf('packages' + path.sep + platform) > -1);
    if (!stagedFiles.length) {
      // 必须有一条命令
      return `echo "skip ts check ${platform}"`;
    }

    const webroot = path.resolve(__dirname, 'packages', platform);
    const tsconfig = JSON.parse(fs.readFileSync(path.resolve(webroot, 'tsconfig.json'), 'utf8'));
    tsconfig.include = [...stagedFiles, path.resolve(__dirname, "typings/*.d.ts")];
    fs.writeFileSync(path.resolve(webroot, "tsconfig.lint.json"), JSON.stringify(tsconfig, null, 4));
    return `cd ${webroot} && tsc --noEmit --project tsconfig.lint.json`;
  } catch (e) {
    console.error(e);
    throw e;
  }
}

const generateEslintCheck = () => async (files) => {
  try {
    const eslint = new ESLint();
    const isIgnored = await Promise.all(
      files.map((file) => {
        return eslint.isPathIgnored(file);
      })
    );
    const filteredFiles = files.filter((_, i) => !isIgnored[i]);
    const filesToLint = filteredFiles.join(' ');
    return `cross-env NODE_ENV=production eslint --max-warnings 0 --cache --cache-location .cache/eslint --ignore-path .eslintignore ${filesToLint}`;
  } catch (e) {
    console.error(e);
  }
}

module.exports = {
  // eslint
  "./src/**/*.{jsx,tsx,js,ts}": [
    generateEslintCheck(),
  ],
  // tsc
  "*.{tsx,ts}": [
    (files) => {
      const checkWebTs = generateTsCheck('web');
      const checkAppTs = generateTsCheck('app');
      let cli = '';

      const web = checkWebTs(files);
      if (web) {
        cli = web;
      }

      const app = checkAppTs(files);
      if (app) {
        if (cli) {
          cli += ' && ';
        }
        cli += app;
      }

      return "tsc --pretty --noEmit"
      // return cli;
    },
  ],
  // stylelint
  "*.{css,less}": [
    (files) => {
      if (files.filter(file => file.indexOf('packages' + path.sep + 'web') > -1).length) {
        return 'cd packages/web && npm run stylelint';
      }
      return 'echo "skip stylelint"';
    }
  ]
}
