/**
 * 包含和排除的路径
 */

const path = require('path');

const rootDir = path.resolve(__dirname, '../..');
const projectDir = path.resolve(rootDir, '../..');

const includes = [
  path.resolve(projectDir, 'packages/shared'),
  path.resolve(projectDir, 'node_modules/rxjs/dist/esm'), // version >= 7.1.0
  path.resolve(rootDir, 'node_modules/tdesign-react/esm'),
  path.resolve(rootDir, 'node_modules/tdesign-react/es'),
  path.resolve(rootDir, 'src'),
];

const excludes = [];

module.exports = {
  include: includes,
  exclude: excludes,
};
