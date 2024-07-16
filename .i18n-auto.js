const dirname = __dirname;
const path = require('path');
const globby = require('globby');
const fs = require('fs');
const shelljs = require("shelljs");

const config = {
	rootPath: dirname,
  // 需要遍历的目录，rootPath的相对路径，minimatch语法：https://github.com/isaacs/minimatch#usage
	includePath: ['./src/modules/**'],
  // 转换排除的路径 https://github.com/isaacs/minimatch#usage
  excludePath: ['**/_i18n', '**/*.xlsx',],
  fileType: ['.js', '.jsx', '.ts', '.tsx', '.html'],
	// 获取模块名方法，也就是i18n中namespace的值，入参为filepath，默认为filepath的basename
  getModuleName: (filePath) => {
		console.log('====', filePath);
    let result = "notfound";
    if (filePath.includes("src/modules/")) {
			const m = filePath.split("src/modules/")[1].split("/")[0]
			// 排除直接是文件
			if (m.includes('.')) return result;
      result = m;
    }
    if (filePath.includes("src/apps/")) {
      result = filePath.split("src/apps/")[1].split("/")[0];
    }
    if (filePath.includes("src/components/")) {
      result = "components";
    }
    if (filePath.includes("src/libs/")) {
      result = "libs";
    }
    if (filePath.includes("packages/shared/")) {
      result = "shared"
    }
    return result;
  },
  i18nStorePath: path.resolve(dirname, './src/i18n-store'),
  i18nConfigPath: path.resolve(dirname, './src/i18n/config'),
	i18nDataSource: 'json',
  // i18n组件的名字
	i18nObject: '$i18next',
	// i18n 调用方法
  i18nMethod: 't',
	// 引用i18n组件的引入目录
  // TODO 目前不能根据当前路径替换为相对路径，只能是alias写法
  i18nObjectPath: '@/i18n',
	// 不需要转换的方法名，比如console.log内的文字就不需要国际化
	excludeFunc: ['dayjs.format', 'I18n.t', 'i18n.t2', 'i18n.t', 'history.push', 'console.log', 'date.format', 'moment.format'],
	// 分隔符 转换后i18n key与中文的分割符 如 module:key{separator}中文
  // 分隔符 转换后i18n key的分割符 如 module:key:中文
	separator: ':',
	// 日志路径配置
	logDir: `${dirname}/logs`,
  autoCompleteImport: true,
	// 只输出国际化脚本覆盖到的词条
  outputOnlyUsed: true,
	// prettier的配置
  prettierOptions: {
    useTabs: true,
  },
	extraOutput: (allPath) => {
    function toCamelCase(name) {
      return name.replace(/\-(\w)/g, function (all, letter) {
        return letter.toUpperCase();
      });
    }

    // 解析命令行中入口文件
    const argvs = process.argv.splice(2)
    // 优先使用命令行中的入口文件 没有就取
    const entryFile = argvs?.[0]?.split('entryFile=')?.[1] || config?.entryFile || './src/index.tsx'
		
    if (entryFile) {
			// 下一个文件夹的路径
      // const pathArray = entryFile?.split('/')
      // const configJsName = pathArray?.[pathArray.length - 1]
			
      // 遍历文件夹下json，自动再生成index.js
      const configFiles = globby.sync(`${config.i18nConfigPath}/*.json`, {
				ignore: ["**/index.js"],
        absolute: true,
      });
      
      const configList = configFiles.map((filePath) =>
        path.basename(filePath, ".json")
      );

      // 从解析的所有文件中 找到需要引入的json文件
      const importList = configList.filter(item => allPath.some(path => {
        if (path.module === 'shared' && item === `shared-${configJsName}`) {
          return true
        }
        return path.module === item
      }))
			console.log('-------', argvs,configFiles, configList,importList);

      fs.writeFileSync(
        `${config.i18nConfigPath}/index.js`,
        `${importList
      .map(
        (fileName) => `import ${toCamelCase(fileName)} from './${fileName}.json';`
      )
      .join("\n")}

export const config = [${importList
        .map((name) => toCamelCase(name))
        .join(", ")}]
`,
      "utf8");
    } else {
      console.warn('\n未找到声明的入口文件，跳过国际化配置文件生成步骤！\n')
    }

    // 执行一个格式化
    const commandText = `npx eslint ${config.includePath.join(
      " "
    )} ./src/i18n/config/**.js --ext .js,.jsx,.ts,.tsx --fix --no-error-on-unmatched-pattern --ignore-path ./.eslintignore`
    console.log('执行格式化: ', commandText)
    shelljs.exec(commandText, { silent: false, async: false });
  },
}

module.exports = config;