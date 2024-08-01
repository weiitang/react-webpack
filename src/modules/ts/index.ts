/* eslint-disable no-console */
// import ts from 'typescript';
// import fs from 'fs';
const ts = require('typescript');
const fs = require('fs');

// Here I'm mocking the filename and the code, but you can read this from a real file with any problems
const filename = 'example.ts';
const code = 'const add = (x: number, y: number): number => x + y; add(1, 2);';

// Here we can pass the ECMAScript version in this case I'm passing the latest one
const sourceFile = ts.createSourceFile(filename, code, ts.ScriptTarget.Latest);
console.log('===', sourceFile);

const generateAst = (node, sourceFile) => {
  const syntaxKind = ts.SyntaxKind[node.kind];
  const nodeText = node.getText(sourceFile);

  // console.log('===', syntaxKind, node);

  fs.appendFile('output.txt', `${syntaxKind}: ${nodeText}`, function (err) {
    console.log(err);
  });

  fs.appendFile('output.txt', '\n', function (err) {
    console.log(err);
  });

  node.forEachChild((child) => generateAst(child, sourceFile));
};

generateAst(sourceFile, sourceFile);

export {};
