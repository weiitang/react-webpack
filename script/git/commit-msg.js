#!/usr/bin/env node

const fs = require('fs');
const chalk = require('chalk');

const msg = fs
  .readFileSync(`${process.env.PWD}/${process.argv[2]}`, 'utf-8')
  .trim();

const commitRE = [
  /^((feat|fix|docs|style|refactor|perf|test|chore)(\(.+\))?:).{1,100}/,
  /^Merge.*/gm,
];

if (!commitRE.some((re) => re.test(msg))) {
  console.error(
    `  ${chalk.bgRed.white(' ERROR ')} ${chalk.red(
      `提交信息格式不正确`
    )}\n\n${chalk.red(
      `  请使用正确格式提交信息——type(scope): subject，例如：\n\n`
    )}    ${chalk.green(`feat(button): 修改文案`)}\n` +
      `    ${chalk.green(`refactor: 调整代码结构`)}\n` +
      `    ${chalk.green(`fix: fixbug xxxxx`)}\n\n` +
      `  ${chalk.red(`类型参考如下：`)}\n` +
      `    ${chalk.red(`feat：新功能（feature）`)}\n` +
      `    ${chalk.red(`fix：修补 bug`)}\n` +
      `    ${chalk.red(`docs：文档（documentation）`)}\n` +
      `    ${chalk.red(`style： 格式（不影响代码运行的变动）`)}\n` +
      `    ${chalk.red(
        `refactor：重构（即不是新增功能，也不是修改 bug 的代码变动）`
      )}\n` +
      `    ${chalk.red(`perf：性能 代码变更提高性能`)}\n` +
      `    ${chalk.red(`test：增加测试`)}\n` +
      `    ${chalk.red(`chore：构建过程或辅助工具的变动`)}\n`
  );
  process.exit(1);
}
