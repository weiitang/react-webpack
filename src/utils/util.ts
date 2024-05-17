/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-param-reassign */
import { isDate, isPlainObject } from 'lodash';
import dayjs from 'dayjs';

export function isFile(file) {
  return file instanceof File;
}

export function flatObject(obj, determine?) {
  const flat = (input, path = '', result = {}) => {
    if (Array.isArray(input)) {
      input.forEach((item, i) => flat(item, `${path}[${i}]`, result));
      return result;
    }
    if (
      input &&
      typeof input === 'object' &&
      !isFile(input) &&
      !isDate(input)
    ) {
      if (typeof determine === 'function' && !determine(input)) {
        result[path] = input;
        return result;
      }

      const keys = Object.keys(input);
      keys.forEach((key) => {
        const value = input[key];
        flat(value, !path ? key : `${path}[${key}]`, result);
      });
      return result;
    }

    result[path] = input;
    return result;
  };
  if (!obj || typeof obj !== 'object') {
    return {};
  }
  return flat(obj);
}

/**
 * 比较两个时间点
 * @param a 时间A
 * @param b 时间B
 * @returns A在B之前返回-1，A在B之后返回1，相同返回0
 */
export const compareTime = (a, b) => {
  const dateA = dayjs(a);
  const dateB = dayjs(b);
  if (dateA.isBefore(dateB)) {
    return -1;
  }
  if (dateA.isAfter(dateB)) {
    return 1;
  }
  if (dateA.isSame(dateB)) {
    return 0;
  }
};

/**
 * 根据传入的起始时间给出区间年数组
 */
export const getAllYear = (start: string, end: string) => {
  const result = [];
  const between = dayjs(end).diff(dayjs(start), 'year');
  for (let i = 0; i <= between; i++) {
    result.push(dayjs(end).subtract(i, 'year').format('YYYY'));
  }
  return result;
};

export function htmlToText(htmlContent: string) {
  if (!htmlContent) return htmlContent;
  return htmlContent
    .replace(/<\/p>/gi, '\n')
    .replace(/<br>/gi, '\n')
    .replace(/<br\/>/gi, '\n')
    .replace(/<br \/>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi, '')
    .replace(/&nbsp;/gi, ' ');
}

export function isNumber(value: any) {
  return typeof value === 'number' && !isNaN(value);
}

// https://github.com/facebook/react-native/issues/31537
// 修复Android FormData下上传的文件中文丢失的问题
export function fixAndroidFileName(file: any) {
  // File object object false true
  // H5下不需要处理，RN下的file为plain object，而非File对象
  if (true && isPlainObject(file) && file?.name) {
    Object.assign(file, {
      name: encodeURIComponent(file.name),
    });
  }

  return file;
}

// 常规获取字符长度，按照中文2个字符，其他1个字符计算
export function getLength(text: string): number {
  let length = 0;

  for (const char of text) {
    if (/[\u4e00-\u9fa5]/.test(char)) {
      // 中文字符
      length += 2;
    } else {
      // 其他字符
      length += 1;
    }
  }

  return length;
}

export function replaceHtmlEntities(str: string) {
  if (!str) return str;
  const entities = {
    '&nbsp;': ' ',
    '&lt;': '<',
    '&gt;': '>',
    '&amp;': '&',
    '&quot;': '"',
    '&apos;': "'",
    // 这里可以添加更多的字符实体
  };

  return str.replace(/&[\w]+;/g, (entity) => entities[entity] || entity);
}

export function percentageToFixed(value: any, limit = 2) {
  let toNum = value;
  // 空字符不处理
  if (value === '') return value;

  if (typeof value === 'string') {
    toNum = Number(value);
  }
  if (typeof toNum === 'number' && isFinite(toNum)) {
    return (toNum > 1 ? toNum : toNum * 100).toFixed(limit);
  }
  return value;
}
