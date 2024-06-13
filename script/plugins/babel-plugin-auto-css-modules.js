// https://blog.csdn.net/qihoo_tech/article/details/104809763

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { extname } = require('path');
const CSS_FILE_EXTENSIONS = ['.css', '.scss', '.sass', '.less'];

module.exports = () => ({
  visitor: {
    ImportDeclaration(path) {
      const { specifiers, source } = path.node;
      const { value } = source;
      const [file, query] = value.split('?');
      const items = query ? query.split('&') : [];

      const hasGiven = query ? items.some((item) => item === 'module') : false;
      if (!hasGiven && CSS_FILE_EXTENSIONS.includes(extname(file)) && specifiers.length) {
        source.value = `${file}?${['module', ...items].join('&')}`;
      }
    },
  },
});
