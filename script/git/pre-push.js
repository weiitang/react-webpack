#!/usr/bin/env node

const chalk = require('chalk');
const { exec } = require('../utils');

// 获取base分支
function getBaseBranch() {
  return exec(
    `git show-branch | sed "s/].*//" \
    | grep "\\*" \
    | grep -v "$(git rev-parse --abbrev-ref HEAD)" \
    | head -n1 \
    | sed "s/^.*\\[//"`
  );
}

/**
 * 获取该分支上一次push的commit hash
 * @param {*} branch
 * @returns
 */
function getPrevPushedCommit(branch) {
  try {
    return exec(`git rev-parse origin/${branch}`);
  } catch (e) {
    // 此时，有可能该分支是本地新创建的，根本不存在远端分支
    const base = getBaseBranch();
    return exec(`git rev-parse ${base}`);
  }
}

// 对比HEAD和远端分支
function diffBranch(branch1, branch2) {
  const diff = exec(`git diff --name-only ${branch1} ${branch2}`);
  return diff.split('\n').filter(Boolean);
}

function isFileInDir(file, dir) {
  return file.indexOf(dir) > -1;
}

try {
  // 执行一次 pull 避免每次检查了半天发现没有拉最新
  try {
    exec('git pull', true);
  } catch (e) {}

  const uncommits = exec('git status --porcelain');
  const currentBranch = exec('git rev-parse --abbrev-ref HEAD').trim();
  const baseCommit = getPrevPushedCommit(currentBranch);
  // 把当前分支和上一次push的commit进行对比，找出从上一次push到现在有哪些文件发生变化
  const fileList = diffBranch(currentBranch, baseCommit);

  // eslint-disable-next-line no-console
  console.log('本次推送变更文件：\n', JSON.stringify(fileList, null, 4));

  const changed = {};
  fileList.forEach((file) => {
    if (isFileInDir(file, 'packages/app')) {
      changed.app = true;
    } else if (isFileInDir(file, 'packages/web')) {
      changed.web = true;
    } else if (isFileInDir(file, 'packages/shared')) {
      changed.shared = true;
    }
  });

  if (changed.shared) {
    exec('npm run check', true);
    exec('cd packages/web && npm run check', true);
    exec('cd packages/app && npm run check', true);
  } else if (changed.web && !changed.app) {
    exec('cd packages/web && npm run check', true);
  } else if (changed.app && !changed.web) {
    exec('cd packages/app && npm run check', true);
  }

  if (uncommits) {
    // eslint-disable-next-line no-console
    console.log(
      chalk.red(
        `${uncommits}\n以上文件尚未提交，不提交则可能本地的检查与线上的代码检查是不一致，本次推送可能存在风险，请再次确认这些文件是否不需要推送。`
      )
    );
  }
} catch (err) {
  console.error('execute error：');
  console.error(err.toString());
  process.exit(1);
}
