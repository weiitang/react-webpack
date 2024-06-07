/* eslint-disable no-param-reassign */
/* eslint-disable prefer-const */
/**
 * @module functions/string
 */

import { createArray } from './array';

/**
 * 根据设定来把一个字符串按照特定位数进行分割
 * @param {string} input 输入的字符串
 * @param {string} separator 分隔符，例如,-空格等
 * @param {number} segments 每一组有多少个字，如果是个数组，那么按照数组中的进行切分，溢出数组部分不在分组
 * @param {string} alignright 从那边开始计算，true|false 默认是false，表示从左边开始计数进行分组
 * @example
 * formatStringBySeparator('1217735', ',', 3, true) // => 1,217,735 // 千分位分隔符
 * formatStringBySeparator('6442819288374483823', ' ', 4) // => 6442 8192 8837 4483 823 // 银行卡号
 * formatStringBySeparator('13438291192', ' ', [3, 4, 4]) // => 134 3829 1192 // 手机号码
 * formatStringBySeparator('asdweiksdajhfa', ' ', [3, 2, 3]) // => asd we iks dajhfa
 */
export function formatStringBySeparator(
  input: string,
  separator: string,
  segments: number | number[],
  alignright?: boolean
) {
  if (typeof input !== 'string' || !input) {
    return '';
  }
  if (typeof separator !== 'string' || !separator) {
    return input;
  }
  if (!segments) {
    return input;
  }

  const letters = input.split('');

  if (alignright) {
    letters.reverse();
  }

  const points = Array.isArray(segments) ? [].concat(segments) : [segments];
  const result = [];
  let count = points[0];

  for (let i = 0, len = letters.length; i < len; i++) {
    if (typeof segments === 'number') {
      if (i > 0 && i % count === 0) {
        result.push(separator);
      }
    } else if (Array.isArray(segments) && points.length) {
      if (i > 0 && i % count === 0) {
        result.push(separator);
        points.shift();
        count += points.length ? points[0] : 0;
      }
    }

    const char = letters[i];
    result.push(char);
  }

  if (alignright) {
    result.reverse();
  }

  const output = result.join('');
  return output;
}

/**
 * 对字符串向左补位
 * @param {*} str 原始字符串
 * @param {*} len 要求字符串应该为多长
 * @param {*} pad 被用来补位的字符，注意，仅支持一个字符
 */
export function padLeft(str: string, len: number, pad: string) {
  if (str.length >= len) {
    return str;
  }

  const diff = len - str.length;
  const letters = createArray(pad, diff);

  return letters.join('') + str;
}

/**
 * 对字符串向右补位
 * @param {*} str
 * @param {*} len
 * @param {*} pad
 */
export function padRight(str: string, len: number, pad: string) {
  if (str.length >= len) {
    return str;
  }

  const diff = len - str.length;
  const letters = createArray(pad, diff);

  return str + letters.join('');
}

/**
 * 找出两个字符串的不同
 * @param {*} str1
 * @param {*} str2
 * @return {array} 两个字符串中间不同的段，[i:位置索引, char1:第一个字符串在该位置上的字符, char2:第二个字符串在该位置上的字符]，
 * 注意：这个函数不能剔除掉找到的这段字符串中，如果还有相同段的情况，例如：
 * a = 'aBcdEf', b = 'abdef'
 * 虽然d这个字符是相同的，但是无法找到它，所以最终结果会是
 * [
 *   [1, B, b],
 *   [2, c, d],
 *   [3, d, e],
 *   [4, E, f],
 * ]
 * 它总是基于更长的字符串进行对比。
 * 因此，它更适合用于等长字符串之间的diff
 */
export function diffString(str1, str2) {
  const len = Math.max(str1.length, str2.length);
  let results = [];
  // 正序遍历
  for (let i = 0; i < len; i++) {
    const char1 = str1.charAt(i);
    const char2 = str2.charAt(i);
    // 记录不同值
    if (char1 !== char2) {
      results.push([i, char1, char2]);
    }
  }
  // 逆序遍历
  const rstr1 = str1.split('').reverse().join('');
  const rstr2 = str2.split('').reverse().join('');
  for (let i = 0; i < len; i++) {
    const char1 = rstr1.charAt(i);
    const char2 = rstr2.charAt(i);
    // 删除相同值
    if (char1 === char2) {
      const ri = len - 1 - i;
      results = results.filter((item) => item[0] !== ri);
    }
  }
  return results;
}

/**
 * 获取一个字符串的hash
 * @param {*} str
 */
export function getStringHash(str) {
  let hash = 5381;
  let i = str.length;

  while (i) {
    i -= 1;
    hash = (hash * 33) ^ str.charCodeAt(i);
  }

  /**
   * JavaScript does bitwise operations (like XOR, above) on 32-bit signed
   * integers. Since we want the results to be always positive, convert the
   * signed int to an unsigned by doing an unsigned bitshift.
   */
  return hash >>> 0;
}

/**
 * 生成随机字符串
 * @param {*} length
 */
export function createRandomString(length = 16) {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let text = '';
  for (let i = 0; i < length; i++) {
    text += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return text;
}

/**
 * 字符串插值
 * https://github.com/gillesruppert/node-interpolate/blob/master/lib/interpolate.js
 * @param {*} template
 * @param {*} data
 * @param {*} opts
 */
export function interpolate(template, data, opts) {
  let regex;
  let lDel;
  let rDel;
  let delLen;
  let lDelLen;
  let delimiter;
  // For escaping strings to go in regex
  const regexEscape = /([$^\\/()|?+*[\]{}.-])/g;

  opts = opts || {};

  delimiter = opts.delimiter || '{}';
  delLen = delimiter.length;
  lDelLen = Math.ceil(delLen / 2);
  // escape delimiters for regex
  lDel = delimiter.substr(0, lDelLen).replace(regexEscape, '\\$1');
  rDel = delimiter.substr(lDelLen, delLen).replace(regexEscape, '\\$1') || lDel;

  // construct the new regex
  regex = new RegExp(`${lDel}[^${lDel}${rDel}]+${rDel}`, 'g');

  return template.replace(regex, (placeholder) => {
    const key = placeholder.slice(lDelLen, -lDelLen);
    const keyParts = key.split('.');
    let val;
    let i = 0;
    const len = keyParts.length;

    if (key in data) {
      // need to be backwards compatible with "flattened" data.
      val = data[key];
    } else {
      // look up the chain
      val = data;
      for (; i < len; i++) {
        if (keyParts[i] in val) {
          val = val[keyParts[i]];
        } else {
          return placeholder;
        }
      }
    }
    return val;
  });
}
