/**
 * @module functions/datetime
 * @link https://github.com/tangshuang/ts-fns/blob/master/src/date.js
 */

import { isFunction, isInstanceOf, isNumber, isNumeric, isString } from './is';
import { padRight, padLeft } from './string';
import { createArray } from './array';

export const DATE_MONTHS = [
  '一月',
  '二月',
  '三月',
  '四月',
  '五月',
  '六月',
  '七月',
  '八月',
  '九月',
  '十月',
  '十一月',
  '十二月',
];

export const DATE_WEEKS = [
  '星期日',
  '星期一',
  '星期二',
  '星期三',
  '星期四',
  '星期五',
  '星期六',
];

export const DATE_MS = {
  am: 'am',
  pm: 'pm',
  AM: 'AM',
  PM: 'PM',
};

export const DATE_EXPS = {
  YYYY: '[12][0-9]{3}',
  YY: '[0-9]{2}',
  M: '[1-9]|1[0-2]',
  MM: '0[1-9]|1[0-2]',
  MMM: DATE_MONTHS.join('|'),
  D: '[1-9]|[1-2][0-9]|3[0-1]',
  DD: '[0-2][0-9]|3[0-1]',
  W: '[0-6]',
  WWW: DATE_WEEKS.join('|'),
  H: '[0-9]|1[0-9]|2[0-3]',
  HH: '[01][0-9]|2[0-3]',
  h: '[0-9]|1[0-2]',
  hh: '0[0-9]|1[0-2]',
  a: `${DATE_MS.am}|${DATE_MS.pm}`,
  A: `${DATE_MS.AM}|${DATE_MS.PM}`,
  m: '[0-9]|[1-5][0-9]',
  mm: '[0-5][0-9]',
  s: '[0-9]|[1-5][0-9]',
  ss: '[0-5][0-9]',
  S: '[0-9]|[1-9][0-9]|[1-9][0-9]{2}',
  SSS: '[0-9]{3}',
};

export const DATE_FORMATTERS = (() => {
  const pad = (num) => (num < 10 ? `0${num}` : `${num}`);
  return {
    YYYY: (date) => `${date.getFullYear()}`,
    YY: (date) => `${date.getFullYear() % 100}`,
    M: (date) => `${date.getMonth() + 1}`,
    MM: (date) => pad(date.getMonth() + 1),
    MMM: (date) => DATE_MONTHS[date.getMonth()],
    D: (date) => `${date.getDate()}`,
    DD: (date) => pad(date.getDate()),
    W: (date) => `${date.getDay()}`,
    WWW: (date) => DATE_WEEKS[date.getDay()],
    H: (date) => `${date.getHours()}`,
    HH: (date) => pad(date.getHours()),
    h: (date) => `${date.getHours() % 12}`,
    hh: (date) => pad(date.getHours() % 12),
    a: (date) => (date.getHours() < 12 ? DATE_MS.am : DATE_MS.pm),
    A: (date) => (date.getHours() < 12 ? DATE_MS.AM : DATE_MS.PM),
    m: (date) => `${date.getMinutes()}`,
    mm: (date) => pad(date.getMinutes()),
    s: (date) => `${date.getSeconds()}`,
    ss: (date) => pad(date.getSeconds()),
    S: (date) => `${date.getMilliseconds()}`,
    SSS: (date) => padLeft(`${date.getMilliseconds()}`, 3, '0'),
  };
})();

const getFormatterKeys = () => {
  const parserKeys = Object.keys(DATE_EXPS);
  parserKeys.sort();
  parserKeys.reverse();
  return parserKeys;
};
// const ensureRegExpString = (formatter) => {
//   const sign = '*.?+$^[](){}|\\/'
//   const signArr = sign.split('')
//   const formatterArr = formatter.split('')
//   const formatterList = formatterArr.map(char => signArr.indexOf(char) > -1 ? '\\' + char : char)
//   const formatterStr = formatterList.join('')
//   return formatterStr
// }

/**
 * convert 'a' to unicode '\uaaa0', 'A' to '\uaaa1'
 * @param {*} a
 */
const convertCharToUnicode = (char) => {
  const lower = char.toLowerCase();
  const isLower = char === lower;
  const end = isLower ? 0 : 1;

  const arr = createArray(lower, 3);
  const str = arr.join('') + end;
  const unicode = `\\u${str}`;
  const obj = JSON.parse(`["${unicode}"]`);
  const unichar = obj[0];
  return unichar;
};

const convertUnicodeToChar = (unichar) => {
  const code = unichar.charCodeAt(0);
  const unicode = code.toString(16);
  const char = unicode.substr(0, 1);
  const end = unicode.substr(-1);
  const letter = end === '1' ? char.toUpperCase() : char;
  return letter;
};
const parseFormatter = (formatter, fn) => {
  const parserKeys = getFormatterKeys();
  // the following code allow use to use formatter like `YY-MM\\M`, the last `\\M` will turn out to be `M` in the final output string
  const replaceReg = new RegExp(`\\\\(${parserKeys.join('|')})`, 'g');
  const replacedChars = [];
  const preFormatted = formatter.replace(replaceReg, (matched, letter) => {
    const unichar = convertCharToUnicode(letter);
    replacedChars.push(unichar);
    return unichar;
  });

  const formatterReg = new RegExp(`(${parserKeys.join('|')})`, 'g');
  const afterFormatted = preFormatted.replace(
    formatterReg,
    (matched, found) => {
      if (isFunction(fn)) {
        return fn(found);
      }
      return found;
    }
  );

  let output = afterFormatted;
  for (let i = 0, len = replacedChars.length; i < len; i++) {
    const letter = replacedChars[i];
    const char = convertUnicodeToChar(letter);
    output = output.replace(letter, char);
  }

  return output;
};
const parseDate = (dateString, formatter) => {
  const foundParsers = [];
  const dateExp = parseFormatter(formatter, (found) => {
    foundParsers.push(found);
    return `(${DATE_EXPS[found]})`;
  });
  const dateReg = new RegExp(dateExp);

  if (!dateReg.test(dateString)) {
    return null;
  }

  const dateFound = [];
  dateString.replace(dateReg, (matched, ...founds) => {
    dateFound.push(...founds);
  });

  const dateRes = {};
  foundParsers.forEach((key, i) => {
    if (dateRes[key]) {
      return;
    }
    dateRes[key] = dateFound[i];
  });

  return dateRes;
};

// 将 2019-09-11 12:11 这样的字符串解析出来
const parseFormalDate = (dateString) => {
  const [date, time = ''] = dateString.split(' ');
  const [Y, M = '01', D = '01'] = date.split('-');
  const [H = '00', m = '00', s = '00'] = time.split(':');
  return [+Y, +M - 1, +D, +H, +m, +s] as const;
};

/**
 * 创建日期对象，不同操作系统的 new Date 表现不一致，系统中所有new Date应该替换为本处的 createDate 代替，同时还可以支持预处理格式
 * @param {string|number|numeric|Date} datetime
 * @param {string} [givenFormatter] 传入的字符串的日期格式
 */
export function createDate(datetime, givenFormatter) {
  if (isInstanceOf(datetime, Date)) {
    return datetime;
  }

  if (isNumber(datetime)) {
    return new Date(datetime);
  }

  if (isNumeric(datetime)) {
    return new Date(+datetime);
  }

  if (!isString(datetime)) {
    return new Date();
  }

  if (!givenFormatter) {
    const items = parseFormalDate(datetime);
    return new Date(...items);
  }

  const parsedDate = parseDate(datetime, givenFormatter) as {
    [key in keyof typeof DATE_EXPS]: string;
  };
  if (!parsedDate) {
    const items = parseFormalDate(datetime);
    return new Date(...items);
  }

  const Y =
    +(parsedDate.YYYY || `20${parsedDate.YY}`) || new Date().getFullYear();
  const D = +(parsedDate.DD || parsedDate.D) || 1;
  const m = +(parsedDate.mm || parsedDate.m) || 0;
  const s = +(parsedDate.ss || parsedDate.s) || 0;

  let mon = 0;
  if (parsedDate.MM || parsedDate.M) {
    mon = +(parsedDate.MM || parsedDate.M) - 1 || 0;
  } else if (parsedDate.MMM) {
    const m = parsedDate.MMM;
    let i = DATE_MONTHS.indexOf(m);
    i = i === -1 ? 0 : i;
    mon = i;
  }

  let hor = 0;
  if (parsedDate.HH || parsedDate.H) {
    hor = +(parsedDate.HH || parsedDate.H) || 0;
  } else if (parsedDate.hh || parsedDate.h) {
    const a = (parsedDate.a || parsedDate.A || 'am').toLowerCase();
    const h = +(parsedDate.hh || parsedDate.h) || 0;
    hor = a === 'pm' ? h + 12 : h;
  }

  let ms = 0;
  if (parsedDate.SSS) {
    ms = +parsedDate.SSS;
  } else if (parsedDate.S) {
    ms = +padRight(parsedDate.S, 3, '0');
  }

  return new Date(Y, mon, D, hor, m, s, ms);
}

/**
 * 格式化时间
 * @param {string|number} datetime 给定的时间，会先经过createDate处理
 * @param {string} formatter 被格式化为什么格式
 * @param {string} [givenFormatter] 给定的时间是什么格式（预处理格式）
 * @returns {string}
 */
export function formatDatetime(datetime, formatter, givenFormatter) {
  if (!datetime) {
    return;
  }
  if (!formatter) {
    return;
  }

  const date = createDate(datetime, givenFormatter);
  const output = parseFormatter(formatter, (found) => {
    const format = DATE_FORMATTERS[found];
    if (format) {
      return format(date);
    }

    return found;
  });

  // the following code ensure the `\\M` to be `M` in formatter
  const parserKeys = getFormatterKeys();
  const formatterExp = `\\\\(${parserKeys.join('|')})`;
  const formatterReg = new RegExp(formatterExp, 'g');

  const res = output.replace(formatterReg, (matched, found) => found);

  return res;
}
