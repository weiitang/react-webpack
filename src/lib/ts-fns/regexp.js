/**
 * @param {string} exp
 * @returns {string}
 */
export function createSafeExp(exp) {
  const sign = '*.?+-$^!<>[](){}|\\/';
  const signArr = sign.split('');
  const expArr = exp.split('');
  const expList = expArr.map((char) => (signArr.indexOf(char) > -1 ? `\\${char}` : char));
  const safeExp = expList.join('');
  return safeExp;
}

/**
 * @param {RegExp} regexp
 * @param {string} str
 * @returns {array}
 */
export function matchAll(regexp, str) {
  const results = [];
  let match;

  while ((match = regexp.exec(str)) !== null) {
    results.push(match);
  }

  return results;
}
