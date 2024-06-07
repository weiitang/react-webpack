/* eslint-disable @typescript-eslint/ban-types */
import { unionArray } from './array';

export function isUndefined(value: any): boolean {
  return typeof value === 'undefined';
}

export function isNull(value: any): boolean {
  return value === null;
}

export function isNil(value: any): boolean {
  return isUndefined(value) || isNull(value);
}

export function isArray(value: any): boolean {
  return (
    Array.isArray(value) ||
    Object.prototype.toString.call(value) === '[object Array]'
  );
}

export function isObject(value: any): boolean {
  return value && typeof value === 'object' && value.constructor === Object;
}

export function isTruthyObject(value: any): boolean {
  return value && typeof value === 'object' && !isArray(value);
}

export function isPlainObject(value: any): boolean {
  if (!value || typeof value !== 'object') {
    return false;
  }
  let proto = value;
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }
  return Object.getPrototypeOf(value) === proto;
}

export function isDate(value: any): boolean {
  return value instanceof Date;
}

export function isString(value: any): boolean {
  return typeof value === 'string';
}

export function isNumber(value: any): boolean {
  return typeof value === 'number' && !isNaN(value);
}

export function isBoolean(value: any): boolean {
  return value === true || value === false;
}

export function isSymbol(value: any): boolean {
  return typeof value === 'symbol';
}

/**
 * 判断是否为数字的字符串形式，支持小数点和负数
 * @param {*} value
 */
export function isNumeric(value: any): boolean {
  return isString(value) && /^-{0,1}[0-9]+(\.{0,1}[0-9]+){0,1}$/.test(value);
}

/**
 * 判断一个对象是否是一个形式如Blob的对象，注意，不是判断它是否为Blob实例
 * @param {*} value
 */
export function isBlob(value: any): boolean {
  return (
    value && typeof value.size === 'number' && typeof value.type === 'string'
  );
}

/**
 * 判断一个对象是否为形式如File的对象，注意，不是判断它是否为File实例
 * @param {*} value
 */
export function isFile(value: any): boolean {
  return (
    isBlob(value) &&
    (typeof value.lastModifiedDate === 'object' ||
      typeof value.lastModified === 'number') &&
    typeof value.name === 'string'
  );
}

/**
 * 判断一个对象是否是iOS选择的文件对象，注意，它不是什么file的实例，仅仅是一个形式判断
 * @param {*} value
 */
export function isIOSFile(value: any): boolean {
  return (
    value &&
    typeof value.localId === 'string' &&
    typeof value.type === 'string' &&
    typeof value.name === 'string'
  );
}

export function isFormData(value: any): boolean {
  return value instanceof window.FormData;
}

/**
 * 判断一个值是否为空值，为空的情况包含：null, undefined, NaN, 空字符串，空数组，空对象
 * @param {*} value
 */
export function isEmpty(value: any): boolean {
  if (
    value === null ||
    value === undefined ||
    value === '' ||
    (typeof value === 'number' && isNaN(value))
  ) {
    return true;
  }
  if (isArray(value)) {
    return value.length === 0;
  }
  if (isObject(value)) {
    return Object.keys(value).length === 0;
  }
  return false;
}

export function isFunction(value: any): boolean {
  return (
    typeof value === 'function' &&
    `${value}` !== `function ${value.name}() { [native code] }` && // 类似String, Number这种
    `${value}`.indexOf('class ') !== 0 && // 类声明
    `${value}`.indexOf('_classCallCheck(this,') === -1
  ); // babel转译class后的结果
}

/**
 * 判断是否为真
 * @param {*} value
 */
export function isTruthy(value: any): boolean {
  return !!value;
}

/**
 * 判断是否为假
 * @param {*} value
 */
export function isFalsy(value: any): boolean {
  return !value;
}

/**
 * 判断两个值是否内容相等（而非引用相等）
 * @param {*} val1
 * @param {*} val2
 */
export function isEqual(val1: any, val2: any): boolean {
  const equal = (obj1: object, obj2: object) => {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    const keys = unionArray(keys1, keys2);
    for (let i = 0, len = keys.length; i < len; i++) {
      const key = keys[i];
      if (!inArray(key, keys1)) {
        return false;
      }
      if (!inArray(key, keys2)) {
        return false;
      }
      const value1 = obj1[key];
      const value2 = obj2[key];
      if (!isEqual(value1, value2)) {
        return false;
      }
    }
    return true;
  };
  if (isObject(val1) && isObject(val2)) {
    return equal(val1, val2);
  }
  if (isArray(val1) && isArray(val2)) {
    return equal(val1, val2);
  }
  return val1 === val2;
}

/**
 * a是否小于b
 * @param {*} a
 * @param {*} b
 */
export function isLt(a: number, b: number): boolean {
  return a < b;
}

/**
 * a是否小于等于b
 * @param {*} a
 * @param {*} b
 */
export function isLte(a: number, b: number): boolean {
  return a <= b;
}

/**
 * a是否大于b
 * @param {*} a
 * @param {*} b
 */
export function isGt(a: number, b: number): boolean {
  return a > b;
}

/**
 * a是否大于等于b
 * @param {*} a
 * @param {*} b
 */
export function isGte(a: number, b: number): boolean {
  return a >= b;
}

/**
 * 判断给定值是否是一个 Promise 对象
 *
 * @param  {Any}  value
 * @return {Boolean}
 */
export function isPromise(value: any): boolean {
  return (
    value &&
    (typeof value === 'object' || typeof value === 'function') &&
    typeof value.then === 'function'
  );
}

/**
 * 判断某值是否是一个类的实例
 * @param {*} value
 * @param {*} constructor
 * @param {*} real 是否是该类的直属实例，例如 file 同时是File和Blob的实例，但是不是Blob的直属实例，当real设置为true时，isInstanceOf(file, Blob, true)返回false
 */
export function isInstanceOf(
  value: any,
  constructor: Function,
  real = false
): boolean {
  if (!value || typeof value !== 'object') {
    return false;
  }
  if (real) {
    return value.constructor === constructor;
  }
  return value instanceof constructor;
}

/**
 * 判断一个对象中是否包含某个key
 * @param {*} key
 * @param {*} obj
 */
export function inObject(key: string, obj: object): boolean {
  if (typeof obj !== 'object') {
    return false;
  }
  return inArray(key, Object.keys(obj));
}

/**
 * 判断一个值是否在一个数组中
 * @param {*} item
 * @param {*} arr
 */
export function inArray(item: any, arr: any[]): boolean {
  return isArray(arr) && arr.includes(item);
}

/**
 * 判断一个数组的所有元素是否在另外一个数组中
 * @param {*} arr1
 * @param {*} arr2
 */
export function isAllInArray(arr1: any[], arr2: any[]): boolean {
  if (!Array.isArray(arr1) || !Array.isArray(arr2)) {
    return false;
  }
  for (let i = 0, len = arr1.length; i < len; i++) {
    const item = arr1[i];
    if (!arr2.includes(item)) {
      return false;
    }
  }
  return true;
}

/**
 * 判断第一个数组中，是否有起码一个元素，存在于第二个数组中
 * @param {*} items
 * @param {*} arr
 */
export function isOneInArray(items: any[], arr: any[]): boolean {
  if (!Array.isArray(items) || !Array.isArray(arr)) {
    return false;
  }
  // 空数组时，表示一定包含
  if (!items.length) {
    return true;
  }
  const has = arr.some((item) => items.includes(item));
  return has;
}
