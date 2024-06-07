/* eslint-disable no-nested-ternary */
/* eslint-disable no-param-reassign */
/* eslint-disable prefer-destructuring */
/**
 * @module functions/number
 */

/**
 * 数字处理模块
 * 函数命名规则：
 * format开头表示格式化数字为其他非数字格式，
 * convert开头表示将其他非数字格式（类数字格式）转化为常用数字格式，
 * fix开头表示对数字的小数位数进行加工
 */

import { numerify, plusby, minusby, divideby, isNone } from 'ts-fns';
import { formatStringBySeparator, padRight, padLeft } from './string';

/**
 * 根据设定来把一个数字按照特定位数进行分割
 * @param input 输入的数字，可以是字符串形式的数字
 * @param separator 分隔符，例如,-空格等
 * @param count 每一组有多少个字
 * @param formatdecimal 是否要对小数部分也进行格式化
 */
export function formatNumberBySeparator(
  input: string | number,
  separator: string,
  count: number,
  formatdecimal = false
): string {
  if (isNone(input)) {
    return '';
  }

  const num = input.toString();

  if (!/^-{0,1}[0-9]+(\.{0,1}[0-9]+){0,1}$/.test(num)) {
    return '';
  }

  const blocks = num.split(/-|\./);
  const isNegative = num.charAt(0) === '-';
  let integer;
  let decimal;

  if (isNegative) {
    integer = blocks[1];
    decimal = blocks[2] || '';
  } else {
    integer = blocks[0];
    decimal = blocks[1] || '';
  }

  integer = formatStringBySeparator(integer, separator, count, true);
  if (formatdecimal && decimal) {
    decimal = formatStringBySeparator(decimal, separator, count);
  }

  let result = '';
  if (isNegative) {
    result += '-';
  }

  result += integer;

  if (decimal) {
    result += `.${decimal}`;
  }

  return result;
}

/**
 * 将数字转化为用逗号分割的千分位字符串
 * @param {string|number} input 输入的值必须是一个合法的数字或字符串，非法数字或字符串将出现问题，不能直接输入指数型数字
 * @param {boolean} formatdecimal 是否对小数部分也进行千分位格式化，默认禁用
 * @return {string}
 */
export function formatNumberByThousands(
  input: string | number,
  formatdecimal = false
): string {
  return formatNumberBySeparator(input, ',', 3, formatdecimal);
}

/**
 * 将使用逗号分割的千分位数字还原为正常的数字字符串
 * @param {string} input
 * @return {string}
 */
export function convertNumberWithThousands(input: string): string {
  if (isNone(input)) {
    return '';
  }
  return `${input}`.replace(/,/g, '');
}

/**
 * 将一个指数型数字转化为普通数字
 * @param {number|string} input 指数型数字，可以是一个同等合法的字符串
 * @return {string} 转化后的普通数字字符串，因为大值会被自动转化为指数型数字，因此，这里必须返回字符串
 * @example
 * convertNumberWithExponential(1.2e3) => '1200'
 */
export function convertNumberWithExponential(input: string | number): string {
  const num = typeof input === 'string' ? parseFloat(input) : input;
  if (isNaN(num)) {
    return '';
  }

  if (!input && input !== 0) {
    return '';
  }

  const str = input.toString();

  // 如果输入中根本不存在e
  // 当input为12.3e13的时候，str会直接由于.toString成为正常字符串
  if (str.indexOf('e') === -1) {
    return str;
  }

  // 假设input为一个合法的指数型数字或数字字符串，不考虑非法输入的情况
  const [base, exp] = str.split('e');
  const count = Number.parseInt(exp, 10);
  if (count >= 0) {
    const arr = base.split('');
    for (let i = 0; i < count; i++) {
      const index = arr.indexOf('.');
      const next = index === arr.length - 1 ? '0' : arr[index + 1];
      arr[index] = next;
      arr[index + 1] = '.';
    }
    if (arr[arr.length - 1] === '.') {
      arr.pop();
    }
    const result = arr.join('');
    return result;
  }

  // 通过反转数字，把小数点往后移，最后反转过来的方法实现负数指数转化
  const arr = base.split('');
  const rarr = arr.reverse();
  for (let i = count; i < 0; i++) {
    const index = rarr.indexOf('.');
    const next = index === rarr.length - 1 ? '0' : rarr[index + 1];
    rarr[index] = next;
    rarr[index + 1] = '.';
  }
  const rrarr = rarr.reverse();
  if (rrarr[0] === '.') {
    rrarr.unshift('0');
  }
  const result = rrarr.join('');
  return result;
}

/**
 * 移除数字首尾的00
 * @param {*} input
 */
export function clearNumberZero(input: string | number): string {
  input = input.toString();
  let [integerPart, decimalPart = ''] = input.split('.');
  let isNegative = false;
  if (integerPart.indexOf('-') === 0) {
    isNegative = true;
    integerPart = integerPart.substring(1);
  }
  integerPart = integerPart.replace(/^0+/, ''); // 去除开头的000
  decimalPart = decimalPart.replace(/0+$/, ''); // 去除末尾的000
  const value =
    (isNegative && (integerPart || decimalPart) ? '-' : '') +
    (integerPart ? integerPart : '0') +
    (decimalPart ? `.${decimalPart}` : '');
  return value;
}

/**
 * 移除数字小数点部分末尾的 0
 * @param {*} value
 */
export function removeNumberDecimalTailZero(input: string | number): string {
  input = input.toString();
  return input.indexOf('.') !== -1
    ? input.replace(/0+$/, '').replace(/\.$/, '')
    : input;
}

/**
 * 转化数字，保留小数位数，可清空末尾的0
 * @param input 输入的数字，可以是字符串形式的数字
 * @param decimal 要保留的小数位数，默认-1，表示原样输出，不做小数位处理，此时，pad和round无效
 * @param pad 在小数位数不足的情况下，是否要补齐小数位数
 * @param round 取整类型：false: 四舍五入；'ceil': 向上取整；其他情况都是向下取整
 */
export function fixNumber(
  input: string | number,
  decimal = -1,
  pad = false,
  round: boolean | 'ceil' | 'floor' = false
): string {
  const num = typeof input === 'string' ? parseFloat(input) : input;
  if (isNaN(num)) {
    return '';
  }

  let value = numerify(input);
  // eslint-disable-next-line prefer-const
  let [integerPart, decimalPart = ''] = value.split('.');

  // 在小数的末尾一位添加1，得到一个新小数
  const exchargeOneToTail = (dnum, type = 'plus') => {
    const [, decimalPart] = dnum.split('.');
    const dlen = decimalPart.length;
    const one = `0.${padLeft('1', dlen, '0')}`;
    const value = type === 'plus' ? plusby(dnum, one) : minusby(dnum, one);
    return value;
  };

  // 向上取整
  if (decimal === 0 && round === 'ceil') {
    // 小于0时，向上取整需要进一位，这里的进一位是往0的方向进一位
    if (decimalPart && num < 0) {
      integerPart = plusby(integerPart, '1');
    }
    value = integerPart;
  }
  // 向下取整
  else if (decimal === 0 && round) {
    // 小于0时，向下取整需要往远离0的方向补全小数部分
    if (decimalPart && num < 0) {
      integerPart = minusby(integerPart, '1');
    }
    value = integerPart;
  }
  // 四舍五入取整
  else if (decimal === 0) {
    if (decimalPart && +`0.${decimalPart}` >= 0.5) {
      if (num >= 0) {
        integerPart = plusby(integerPart, '1');
      }
      // 小于0时，向下取直接舍弃小数部分，下取到整数
      else {
        integerPart = minusby(integerPart, '1');
      }
    }
    value = integerPart;
  }
  // 舍弃小数位数向上取整
  else if (decimal > 0 && round === 'ceil') {
    const isNegative = num < 0;
    if (decimalPart) {
      if (isNegative) {
        // 负数
        let usePart = decimalPart.substring(0, decimal);
        const dropPart = decimalPart.substring(decimal);

        usePart = `0.${usePart}`;

        // 当一个负数向上取整时，如果原值小数位多于所需要的部分，那么在向上取值时，应该是取到比原始值更大的值，这和正数的规则完全不同
        if (dropPart) {
          usePart = exchargeOneToTail(usePart, 'minus');
        }

        // 负数的情况下，用整数部分减去小数部分即可得到结果
        value = minusby(integerPart, usePart);
      } else {
        // 正数
        value = `${integerPart}.${decimalPart.substring(0, decimal)}`;
      }
    } else {
      value = integerPart;
    }
  }
  // 舍弃小数位数向下取整
  else if (decimal > 0 && round) {
    const isNegative = num < 0;
    if (decimalPart) {
      if (isNegative) {
        // 负数
        let usePart = decimalPart.substring(0, decimal);
        const dropPart = decimalPart.substring(decimal);

        usePart = `0.${usePart}`;

        // 当一个负数向下取整时，如果原值小数位多于所需要的部分，那么在向下取值时，应该是取到比原始值更小的值，这和正数的规则完全不同
        if (dropPart) {
          usePart = exchargeOneToTail(usePart);
        }

        // 负数的情况下，用整数部分减去小数部分即可得到结果
        value = minusby(integerPart, usePart);
      } else {
        // 正数
        value = `${integerPart}.${decimalPart.substring(0, decimal)}`;
      }
    } else {
      value = integerPart;
    }
  }
  // 四舍五入小数位数
  else if (decimal > 0) {
    value = integerPart;
    if (decimalPart) {
      let usePart = decimalPart.substring(0, decimal);
      const dropPart = decimalPart.substring(decimal, decimal + 1); // 获取下一位数值，用于四舍五入判断

      usePart = `0.${usePart}`;

      // 四舍五入
      if (+dropPart >= 5) {
        usePart = exchargeOneToTail(usePart);
      }

      const isNegative = num < 0;
      // 负数的情况下，用整数部分减去小数部分即可得到结果
      if (isNegative) {
        value = minusby(integerPart, usePart);
      } else {
        value = plusby(integerPart, usePart);
      }
    }
  }

  // 清空000
  value = clearNumberZero(value);

  if (pad && decimal) {
    // eslint-disable-next-line prefer-const
    let [integerPart, decimalPart = ''] = value.split('.');
    if ((decimalPart && decimalPart.length < decimal) || !decimalPart) {
      decimalPart = padRight(decimalPart || '', decimal, '0');
      value = `${integerPart}${decimalPart ? `.${decimalPart}` : ''}`;
    }
  }

  return value;
}

/**
 * 将数值从1为单位转化为百万（million）为单位，并且根据配置保留小数
 * @param {string|number} input 输入的数字，可以是字符串形式的数字
 * @param {int} decimal 要保留的小数位数
 * @param {boolean} pad 在小数位数不足的情况下，是否要补齐小数位数
 * @param {boolean} floor 是否向下取值，而不用四舍五入，正数直接丢掉小数位数后面的数字，如果是负数，则是会取完值后变更小
 * @example
 * fixNumberToMillion(11111293000, 2) => '11111.29'
 * // 如果还要进行千分位分隔符，可以用前面的formatNumberByThousands来做
 */
export function fixNumberToMillion(
  input: string | number,
  decimal?: number,
  pad?: boolean,
  floor?: boolean
): string {
  const num = typeof input === 'string' ? parseFloat(input) : input;
  if (isNaN(num)) {
    return '';
  }

  let value = numerify(input);
  value = divideby(value, 1000000);

  return fixNumber(value, decimal, pad, floor);
}

/**
 * 将数值从1为单位转化为十亿（billion）为单位
 * @param {string|number} input 输入的数字，可以是字符串形式的数字
 * @param {int} decimal 要保留的小数位数
 * @param {boolean} pad 在小数位数不足的情况下，是否要补齐小数位数
 * @param {boolean} floor 是否向下取值，而不用四舍五入，正数直接丢掉小数位数后面的数字，如果是负数，则是会取完值后变更小
 */
export function fixNumberToBillion(
  input: string | number,
  decimal?: number,
  pad?: boolean,
  floor?: boolean
): string {
  const num = typeof input === 'string' ? parseFloat(input) : input;
  if (isNaN(num)) {
    return '';
  }

  let value = numerify(input);
  value = divideby(value, 1000000000);

  return fixNumber(value, decimal, pad, floor);
}

/**
 * 将数值从1为单位转化为万亿（trillion）为单位
 * @param {string|number} input 输入的数字，可以是字符串形式的数字
 * @param {int} decimal 要保留的小数位数
 * @param {boolean} pad 在小数位数不足的情况下，是否要补齐小数位数
 * @param {boolean} floor 是否向下取值，而不用四舍五入，正数直接丢掉小数位数后面的数字，如果是负数，则是会取完值后变更小
 */
export function fixNumberToTrillion(
  input: string | number,
  decimal?: number,
  pad?: boolean,
  floor?: boolean
): string {
  const num = typeof input === 'string' ? parseFloat(input) : input;
  if (isNaN(num)) {
    return '';
  }

  let value = numerify(input);
  value = divideby(value, 1000000000000);

  return fixNumber(value, decimal, pad, floor);
}

/**
 * 格式化数值小数位数，并千分位分隔
 * @param {string|number} input 输入的数字，可以是字符串形式的数字
 * @param {int} decimal 要保留的小数位数
 * @param {boolean} pad 在小数位数不足的情况下，是否要补齐小数位数
 * @param {boolean} floor 是否向下取值，而不用四舍五入，正数直接丢掉小数位数后面的数字，如果是负数，则是会取完值后变更小
 */
export function formatNumber(
  input: string | number,
  decimal?: number,
  pad?: boolean,
  floor?: boolean
): string {
  const value = fixNumber(input, decimal, pad, floor);
  const res = formatNumberByThousands(value);
  return res || '';
}

/**
 * 格式化数值，大于百万时转化为mn为单位，小于时不处理，并且最后按千分位拆分
 * @param {string|number} input 输入的数字，可以是字符串形式的数字
 * @param {int} decimal 要保留的小数位数
 * @param {boolean} pad 在小数位数不足的情况下，是否要补齐小数位数
 * @param {boolean} floor 是否向下取值，而不用四舍五入，正数直接丢掉小数位数后面的数字，如果是负数，则是会取完值后变更小
 */
export function formatNumberByMillion(
  input: string | number,
  decimal?: number,
  pad?: boolean,
  floor?: boolean
): string {
  const num = typeof input === 'string' ? parseFloat(input) : input;
  if (isNaN(num)) {
    return '';
  }

  // 至少要大于 100000
  const should = Math.abs(num) >= 100000;

  const value = should
    ? fixNumberToMillion(input, decimal, pad, floor)
    : fixNumber(input, decimal, pad, floor);
  const res = formatNumberByThousands(value);

  if (!res) {
    return '';
  }

  if (should) {
    return `${res}mn`;
  }

  return res;
}

/**
 * 格式化数值，大于十亿时转换为bn为单位，小于时不处理，并且按千分位拆分
 * @param {string|number} input 输入的数字，可以是字符串形式的数字
 * @param {int} decimal 要保留的小数位数
 * @param {boolean} pad 在小数位数不足的情况下，是否要补齐小数位数
 * @param {boolean} floor 是否向下取值，而不用四舍五入，正数直接丢掉小数位数后面的数字，如果是负数，则是会取完值后变更小
 */
export function formatNumberByBillion(
  input: string | number,
  decimal?: number,
  pad?: boolean,
  floor?: boolean
): string {
  const num = typeof input === 'string' ? parseFloat(input) : input;
  if (isNaN(num)) {
    return '';
  }

  const should = Math.abs(num) >= 1000000;

  // 只有当num大于一百万时，才转换
  const value = should
    ? fixNumberToBillion(input, decimal, pad, floor)
    : fixNumber(input, decimal, pad, floor);
  const res = formatNumberByThousands(value);

  if (!res) {
    return '';
  }

  if (should) {
    return `${res}bn`;
  }

  return res;
}

/**
 * 格式化数值，大于万亿时转换为tn为单位，小于时不处理，并且按千分位拆分
 * @param {string|number} input 输入的数字，可以是字符串形式的数字
 * @param {int} decimal 要保留的小数位数
 * @param {boolean} pad 在小数位数不足的情况下，是否要补齐小数位数
 * @param {boolean} floor 是否向下取值，而不用四舍五入，正数直接丢掉小数位数后面的数字，如果是负数，则是会取完值后变更小
 */
export function formatNumberByTrillion(
  input: string | number,
  decimal?: number,
  pad?: boolean,
  floor?: boolean
): string {
  const num = typeof input === 'string' ? parseFloat(input) : input;
  if (isNaN(num)) {
    return '';
  }

  const should = Math.abs(num) >= 1000000000;

  // 只有当num大于10亿时，才转换
  const value = should
    ? fixNumberToTrillion(input, decimal, pad, floor)
    : fixNumber(input, decimal, pad, floor);
  const res = formatNumberByThousands(value);

  if (!res) {
    return '';
  }

  if (should) {
    return `${res}tn`;
  }

  return res;
}

/**
 * 格式化数值为金额格式，当大于万亿时用tn单位，当大于十亿时使用bn单位，当大于百万时使用mn，最后运用千分位分割、小数位数等规则
 * @param {string|number} input 输入的数字，可以是字符串形式的数字
 * @param {int} decimal 要保留的小数位数
 * @param {boolean} pad 在小数位数不足的情况下，是否要补齐小数位数
 * @param {boolean} floor 是否向下取值，而不用四舍五入，正数直接丢掉小数位数后面的数字，如果是负数，则是会取完值后变更小
 */
export function formatNumberByMoney(
  input: string | number,
  decimal?: number,
  pad?: boolean,
  floor?: boolean
): string {
  const num = typeof input === 'string' ? parseFloat(input) : input;
  if (isNaN(num)) {
    return '';
  }

  const NUMABS = Math.abs(num);

  // 统一进位 1万亿展示 1tn; 十亿展示 1bn，而不是之前的 1,000 mn --aoliiwang
  if (NUMABS >= 1000000000000) {
    return formatNumberByTrillion(input, decimal, pad, floor);
  }
  if (NUMABS >= 1000000000) {
    return formatNumberByBillion(input, decimal, pad, floor);
  }
  if (NUMABS >= 100000) {
    return formatNumberByMillion(input, decimal, pad, floor);
  }

  return formatNumber(input, decimal, pad, floor);
}

/**
 * 将数值转化为以万、亿为单位，并且按千分位展示
 * @param {string|number} input 输入的数字，可以是字符串形式的数字
 * @param {int} decimal 要保留的小数位数
 * @param {boolean} pad 在小数位数不足的情况下，是否要补齐小数位数
 * @param {boolean} floor 是否向下取值，而不用四舍五入，正数直接丢掉小数位数后面的数字，如果是负数，则是会取完值后变更小
 * @example
 * formatNumberByUnit(293000, 2, true) => '29.3万'
 */
export function formatNumberByUnit(
  input: string | number,
  decimal?: number,
  pad?: boolean,
  floor?: boolean
): string {
  const num = typeof input === 'string' ? parseFloat(input) : input;
  if (isNaN(num)) {
    return '';
  }

  let unit = '';
  let value = numerify(input);

  if (num < -100000000 || num > 100000000) {
    value = divideby(value, 100000000);
    unit = '亿';
  } else if (num < -10000 || num > 10000) {
    value = divideby(value, 10000);
    unit = '万';
  }

  value = fixNumber(value, decimal, pad, floor);
  const it = formatNumberByThousands(value);

  return it + unit;
}

/**
 * 获取传入数值某位上的数
 * @param {number} num
 * @param {10^n} offset 进位，例如想知道十位上是多少，传入10，getDigit(329842398, 1000) 获取千位数，当offset为负数时，表示获取对应位置小数点值，例如 getDigit(1.232, -100) 表示获取小数点后第二位上的数字，也就是 3
 * @param {boolean} keep 是否返回具体位数相同的值，例如 getDigit(1232, 100, true) === 200
 */
export function getDigit(num, offset = 1, keep = false) {
  const v = offset < 0 ? ~~((-num * offset) % 10) : ~~((num / offset) % 10);
  const res = offset < 0 ? (keep ? -v / offset : v) : keep ? v * offset : v;
  return res;
}

/**
 * 获取第一个不为0的小数位
 * @param {number} num
 */
export function getFirstNonZeroDecimal(num: number | string) {
  const decimalPart = num?.toString()?.split('.')?.[1];
  if (!decimalPart) {
    return 0;
  }
  // eslint-disable-next-line @typescript-eslint/prefer-for-of
  for (let i = 0; i < decimalPart.length; i++) {
    if (decimalPart[i] !== '0') {
      return parseInt(`${i + 1}`, 10);
    }
  }
  return 0;
}
