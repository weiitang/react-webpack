import { inArray } from './is';

/**
 * 创建一个特定位数，且每个元素值相同的数组
 * @param {*} count
 * @param {*} value
 */
export function createArray<T>(value: T, count = 1): T[] {
  return [].fill.call(new Array(count), value);
}

/**
 * 求数组的并集
 * @param {*} a
 * @param {*} b
 * @example
 * unionArray([1, 2], [1, 3]) => [1, 2, 3]
 */
export function unionArray(a: any[], b: any[]): any[] {
  return a.concat(b.filter((v) => !inArray(v, a)));
}

/**
 * 求数组交集
 * @param {*} a
 * @param {*} b
 */
export function interArray(a: any[], b: any[]): any[] {
  return a.filter((v) => b.includes(v));
}

/**
 * 求数组差集，找出a中不在b中的元素
 * @param {*} a
 * @param {*} b
 */
export function diffArray(a: any[], b: any[]): any[] {
  return a.filter((v) => !b.includes(v));
}

/**
 * 求两个数组的补集，即找出所有只存在于自己所在数组，而不存在于另外一个数组的元素的集合
 * @param {*} a
 * @param {*} b
 */
export function compArray(a: any[], b: any[]): any[] {
  const diffa = diffArray(a, b);
  const diffb = diffArray(b, a);
  return diffa.concat(diffb);
}

/**
 * 数组去重
 * @param {*} arr
 * @param {*} prop 如果数组是一组对象，那么支持传入prop，挑选出prop值唯一的元素
 */
export function uniqueArray(arr: any[], prop: string): any[] {
  const exists = [];
  return arr.filter((item) => {
    if (prop) {
      const value = item[prop];
      if (exists.includes(value)) {
        return false;
      }

      exists.push(value);
      return true;
    }

    if (exists.includes(item)) {
      return false;
    }

    exists.push(item);
    return true;
  });
}

/**
 * 类数组聚合转数组，快于 [].slice()
 *
 * @param  {Any[]} list
 * @param  {Number} start 起始位置
 * @return {Array}
 */
export function toArray(list: any[], start = 0) {
  let count = list.length - start;
  const result = new Array(count);
  count -= 1;
  while (count) {
    result[count] = list[count + start];
  }
  return result;
}
