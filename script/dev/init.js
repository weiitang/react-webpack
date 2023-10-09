const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs-extra');

execSync('git config core.ignorecase false');

const projectDir = path.resolve(__dirname, '../..');
// const webDir = path.resolve(projectDir, 'packages/web');

if (!fs.existsSync(path.resolve(projectDir, '.vscode'))) {
  fs.copySync(path.resolve(projectDir, '.samples/.vscode'), path.resolve(projectDir, '.vscode'));
}

// if (!fs.existsSync(path.resolve(webDir, '.env'))) {
//   fs.copySync(path.resolve(webDir, '../../.samples/.env_web'), path.resolve(webDir, '.env'));
// }
