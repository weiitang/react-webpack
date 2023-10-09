/* eslint-disable @typescript-eslint/no-require-imports */

// 从 @implements 目录下实现对应的逻辑
// 读取第一行作为要实现的文件，再直接将实现文件内的内容写到被实现文件的末尾

const fs = require('fs');
const path = require('path');

module.exports = function (contents) {
  const { resourcePath } = this;
  const options = this.getOptions();
  const { abstractDir, implementDir } = options;
  if (resourcePath.indexOf(abstractDir) === 0) {
    const implementFilePath = path.resolve(implementDir, resourcePath.replace(abstractDir, '.'));
    if (fs.existsSync(implementFilePath)) {
      const implementContents = fs.readFileSync(implementFilePath).toString();
      const newContents = composeFileContents(contents, implementContents);
      return newContents;
    }
  }
  return contents;
};

function composeFileContents(sourceContents, implementContents) {
  const sourceLines = sourceContents.split('\n');
  const implementLines = implementContents.split('\n');
  implementLines.shift(); // 去掉第一行，第一行是对原始文件（要被实现的文件）的引入

  const { imports: sourceImports, codes: sourceCodes } = splitCodes(sourceLines);
  const { imports: implementImports, codes: implementCodes } = splitCodes(implementLines);

  const { contents: imports } = composeImports(sourceImports, implementImports);
  const { contents: codes } = composeCodes(sourceCodes, implementCodes);

  return `${imports}\n${codes}`;
}

function splitCodes(lines) {
  const imports = [];
  const codes = [];

  let reach = false;
  let incomment = false;

  lines.forEach((line) => {
    const text = line.trim();
    const push = () => {
      if (reach) {
        codes.push(line);
      } else {
        imports.push(line);
      }
    };

    // 忽略注释
    if (text.indexOf('/*') === 0) {
      incomment = true;
      push();
      return;
    }
    if (text.substring(text.length - 2) === '*/') {
      incomment = false;
      push();
      return;
    }
    if (incomment) {
      push();
      return;
    }
    if (text.indexOf('//') === 0) {
      push();
      return;
    }

    if (text.indexOf('import ') === 0) {
      imports.push(line);
    } else {
      codes.push(line);
      reach = true;
    }
  });

  return { imports, codes };
}

function composeImports(sourceImports, implementImports) {
  // TODO: 需要考虑如果import了相同的变量名的问题
  const importMapping = {};
  const importVars = {};

  sourceImports.forEach((line) => {
    if (line.indexOf('import ') !== 0) {
      return;
    }
    const { vars, src, def } = parseImport(line);
    importMapping[src] = { vars, src, def };
    if (vars) {
      vars.forEach((v) => {
        importVars[v] = true;
      });
    }
    if (def) {
      importVars[def] = true;
    }
  });

  // TODO: 暂时未考虑default的冲突问题
  implementImports.forEach((line) => {
    const { vars, src, def } = parseImport(line);
    if (importMapping[src]) {
      const importVars = importMapping[src].vars;
      // TODO: 暂时未考虑import as后的变量名冲突问题
      if (vars && importVars) {
        importVars.push(...vars);
      }
    } else {
      importMapping[src] = { vars, src, def };
    }
  });

  // 先处理原始的
  const results = [];
  sourceImports.forEach((line) => {
    if (line.indexOf('import ') !== 0) {
      results.push(line);
      return;
    }
    const { src } = parseImport(line);
    const importText = createImport(importMapping[src]);
    results.push(importText);
    delete importMapping[src];
  });

  // 再处理多出来的
  const srcs = Object.keys(importMapping);
  srcs.forEach((src) => {
    const importText = createImport(importMapping[src]);
    results.push(importText);
  });

  return { contents: results.join('\n') };
}

function composeCodes(sourceCodes, implementCodes) {
  const source = sourceCodes.join('\n');
  const imports = `(function() {
    ${implementCodes.join('\n')}
  } ())`;
  return { contents: `${source}\n${imports}` };
}

function parseImport(importLine) {
  const [, exp, src] = importLine.match(/import ([\w\W]+) from ['"](.*?)['"]/m);

  const parseVar = (txt) => {
    // if (txt.indexOf(' as ') > -1) {
    //   const [, v] = item.split(' as ');
    //   return v.trim();
    // }
    const t = txt.trim();
    return t;
  };
  const parseVars = (txt) => {
    const t = txt.substring(1, txt.length - 1);
    const items = t.split(',');
    const list = items.map(parseVar);
    return list;
  };

  const txt = exp.trim();
  if (/^\{.*?\}$/.test(txt)) {
    const vars = parseVars(txt);
    return { vars, src };
  }
  if (/^\w+,.*?\}$/.test(txt)) {
    const [d, i] = txt.split(',').map((item) => item.trim());
    const vars = parseVars(i);
    const def = parseVar(d);
    return { src, vars, def };
  }
  const def = parseVar(txt);
  return { src, def };
}

function createImport(mapItem) {
  const { vars, src, def } = mapItem;
  if (def && vars) {
    return `import ${def}, { ${vars.join(', ')} } from '${src}';`;
  }
  if (def) {
    return `import ${def} from '${src}';`;
  }
  if (vars) {
    return `import { ${vars.join(', ')} } from '${src}';`;
  }
  return '';
}
