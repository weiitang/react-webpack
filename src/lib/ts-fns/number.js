/* eslint-disable */
import { formatString, padRight, padLeft, CHARS } from './string.js';
import { isString, isNumeric, isNumber, isNaN, isUndefined } from './is.js';

/**
 * @param {number|string}
 * @returns {string}
 */
export function numerify(num) {
  if (isString(num)) {
    if (!isNumeric(num)) {
      return '';
    }
    const value = clearNum00(num);
    return value;
  }
  if (isNumber(num)) {
    const value = num.toString();
    if (value.indexOf('e')) {
      return enumerify(value);
    }

    return value;
  }

  return '';
}

/**
 * @param {number|string}
 * @returns {string}
 */
export function enumerify(input) {
  const num = parseFloat(input);
  if (isNaN(num)) {
    return '';
  }

  if (!input && input !== 0) {
    return '';
  }

  const str = input.toString();

  if (str.indexOf('e') === -1) {
    return str;
  }

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
 * @param {number|string}
 * @returns {string}
 */
export function clearNum00(input) {
  // eslint-disable-next-line no-param-reassign
  input = input.toString();
  let [integerPart, decimalPart = ''] = input.split('.');
  let isNegative = false;
  if (integerPart.indexOf('-') === 0) {
    isNegative = true;
    integerPart = integerPart.substring(1);
  }
  integerPart = integerPart.replace(/^0+/, '');
  decimalPart = decimalPart.replace(/0+$/, '');
  const value =
    (isNegative && (integerPart || decimalPart) ? '-' : '') +
    (integerPart ? integerPart : '0') +
    (decimalPart ? `.${decimalPart}` : '');
  return value;
}

/**
 * @param {number|string} a
 * @param {number|string} b
 * @returns {string}
 */
export function plusby(a, b) {
  a = numerify(a);
  b = numerify(b);

  if (a === '0') {
    return b;
  }
  if (b === '0') {
    return a;
  }

  let [ia, da = '0'] = a.split('.');
  let [ib, db = '0'] = b.split('.');

  let na = false;
  let nb = false;
  if (ia.indexOf('-') === 0) {
    ia = ia.substring(1);
    na = true;
  }
  if (ib.indexOf('-') === 0) {
    ib = ib.substring(1);
    nb = true;
  }

  if (na && !nb) {
    return minusby(b, a.substring(1));
  }
  if (nb && !na) {
    return minusby(a, b.substring(1));
  }

  const plus = (x, y) => {
    const xr = x.split('').reverse();
    const yr = y.split('').reverse();
    const len = Math.max(xr.length, yr.length);
    const items = [];
    for (let i = 0; i < len; i++) {
      const xv = xr[i] || '0';
      const yv = yr[i] || '0';
      items[i] = `${+xv + +yv}`;
    }

    const sum = items.reduce((sum, item, index) => {
      const sumlen = sum.length;
      if (sumlen > index) {
        const borrow = sum.substring(0, 1);
        const placed = sum.substring(1);
        const next = `${+borrow + +item}`;
        return next + placed;
      }

      return item + sum;
    }, '');
    return sum;
  };

  const dalen = da.length;
  const dblen = db.length;
  const dlen = Math.max(dalen, dblen);
  if (dalen < dlen) {
    da = padRight(da, dlen, '0');
  }
  if (dblen < dlen) {
    db = padRight(db, dlen, '0');
  }

  const ta = ia + da;
  const tb = ib + db;

  let sum = plus(ta, tb);

  const sumr = sum.split('');
  const sumlen = sumr.length;
  const index = sumlen - dlen;
  sumr.splice(index, 0, '.');
  sum = sumr.join('');

  sum = clearNum00(sum);
  sum = sum === '' ? '0' : sum;

  if (sum !== '0' && na && nb) {
    sum = `-${sum}`;
  }

  return sum;
}

/**
 * @param {number|string} a
 * @param {number|string} b
 * @returns {string}
 */
export function minusby(a, b) {
  a = numerify(a);
  b = numerify(b);

  if (b === '0') {
    return a;
  }
  if (a === '0') {
    if (b.indexOf('-') === 0) {
      return b.substring(1);
    }

    return `-${b}`;
  }
  if (a === b) {
    return '0';
  }

  let [ia, da = '0'] = a.split('.');
  let [ib, db = '0'] = b.split('.');

  let na = false;
  let nb = false;
  if (ia.indexOf('-') === 0) {
    ia = ia.substring(1);
    na = true;
  }
  if (ib.indexOf('-') === 0) {
    ib = ib.substring(1);
    nb = true;
  }

  if (na && !nb) {
    return plusby(a, `-${b}`);
  }
  if (nb && !na) {
    return plusby(a, b.substring(1));
  }

  if (compareby(b, a) > 0) {
    const diff = minusby(b, a);
    return `-${diff}`;
  }

  const minus = (x, y) => {
    const xr = x.split('').reverse();
    const yr = y.split('').reverse();
    const len = Math.max(xr.length, yr.length);
    const items = [];
    for (let i = 0; i < len; i++) {
      const xv = xr[i] || '0';
      const yv = yr[i] || '0';
      items[i] = {
        xv,
        yv,
      };
    }

    let isBorrowed = false;
    const diff = items.reduce((diff, item, index) => {
      let { xv, yv } = item;

      xv = +xv;
      yv = +yv;

      if (isBorrowed) {
        xv--;
      }

      if (xv < yv) {
        isBorrowed = true;
        xv += 10;
      } else {
        isBorrowed = false;
      }

      const v = xv - yv;
      diff = v + diff;

      return diff;
    }, '');

    return diff;
  };

  const dalen = da.length;
  const dblen = db.length;
  const dlen = Math.max(dalen, dblen);
  if (dalen < dlen) {
    da = padRight(da, dlen, '0');
  }
  if (dblen < dlen) {
    db = padRight(db, dlen, '0');
  }

  const ta = ia + da;
  const tb = ib + db;

  let diff = minus(ta, tb);

  const diffr = diff.split('');
  const difflen = diffr.length;
  const index = difflen - dlen;
  diffr.splice(index, 0, '.');
  diff = diffr.join('');

  diff = clearNum00(diff);
  diff = diff === '' ? '0' : diff;

  return diff;
}

/**
 * @param {number|string} a
 * @param {number|string} b
 * @returns {string}
 */
export function multiplyby(a, b) {
  a = numerify(a);
  b = numerify(b);

  if (a === '0' || b === '0') {
    return '0';
  }
  if (a === '1') {
    return b;
  }
  if (b === '1') {
    return a;
  }
  if (a === '-1') {
    if (b.indexOf('-') === 0) {
      return b.substring(1);
    }

    return `-${b}`;
  }
  if (b === '-1') {
    if (a.indexOf('-') === 0) {
      return a.substring(1);
    }

    return `-${a}`;
  }
  if (/^10+/.test(b)) {
    const wei = Math.log10(b);
    let value = numerify(a);
    const [integerPart, decimalPart = ''] = value.split('.');
    const decimalLen = decimalPart.length;
    if (decimalLen <= wei) {
      value = integerPart + padRight(decimalPart, wei, '0');
    } else {
      value = `${integerPart + decimalPart.substring(0, wei)}.${decimalPart.substring(wei)}`;
    }
    value = clearNum00(value);
    return value;
  }

  const multiply = (a, b) => {
    const result = [];
    const aArr = a
      .toString()
      .split('')
      .map((t) => parseInt(t));
    const bArr = b
      .toString()
      .split('')
      .map((t) => parseInt(t));
    const aLen = aArr.length;
    const bLen = bArr.length;

    for (let bIndex = bLen - 1; bIndex >= 0; bIndex--) {
      for (let aIndex = aLen - 1; aIndex >= 0; aIndex--) {
        const index = bIndex + aIndex;
        if (!result[index]) {
          result[index] = 0;
        }
        result[index] += bArr[bIndex] * aArr[aIndex];
      }
    }

    result.reverse();
    for (let i = 0; i < result.length; i++) {
      if (!result[i]) {
        result[i] = 0;
      }

      const more = parseInt(result[i] / 10);
      if (more > 0) {
        if (!result[i + 1]) {
          result[i + 1] = 0;
        }
        result[i + 1] += more;
      }
      result[i] = result[i] % 10;
    }
    result.reverse();

    return result.join('');
  };

  let [ia, da = ''] = a.split('.');
  let [ib, db = ''] = b.split('.');

  let na = false;
  let nb = false;
  let isNegative = false;
  if (ia.indexOf('-') === 0) {
    ia = ia.substring(1);
    na = true;
  }
  if (ib.indexOf('-') === 0) {
    ib = ib.substring(1);
    nb = true;
  }
  if ((na && !nb) || (!na && nb)) {
    isNegative = true;
  }

  const totalResult = multiply(clearNum00(ia + da), clearNum00(ib + db));
  const decimalCount = da.length + db.length;
  let finalResult = totalResult;
  if (decimalCount && decimalCount > totalResult.length) {
    finalResult = `0.${padLeft(totalResult, decimalCount, '0')}`;
  } else if (decimalCount) {
    const index = totalResult.length - decimalCount;
    finalResult = `${totalResult.substring(0, index)}.${totalResult.substring(index)}`;
  }

  let value = clearNum00(finalResult);
  value = (isNegative ? '-' : '') + finalResult;
  value = finalResult === '' ? '0' : finalResult;

  return value;
}

/**
 * @param {number|string} a
 * @param {number|string} b
 * @param {number} [decimal] decimal length
 * @returns {string}
 */
export function divideby(a, b, decimal) {
  if (isUndefined(decimal)) {
    decimal = divideby.InfiniteDecimalLength || 15;
  }

  a = numerify(a);
  b = numerify(b);

  if (b === '0') {
    throw new Error('除数不能为0');
  }

  if (a === '0') {
    return '0';
  }
  if (b === '1') {
    return a;
  }
  if (a === b) {
    return '1';
  }
  if (/^10+/.test(b)) {
    const wei = Math.log10(b);
    let value = numerify(a);
    const [integerPart, decimalPart = ''] = value.split('.');
    const integerLen = integerPart.length;
    if (integerLen <= wei) {
      value = `0.${padLeft(integerPart, wei, '0')}${decimalPart}`;
    } else {
      const pos = integerLen - wei;
      const left = integerPart.substring(0, pos);
      const right = integerPart.substring(pos);
      value = `${left}.${right}${decimalPart}`;
    }
    value = clearNum00(value);
    return value;
  }

  let na = false;
  let nb = false;
  let isNegative = false;
  if (a.indexOf('-') === 0) {
    a = a.substring(1);
    na = true;
  }
  if (b.indexOf('-') === 0) {
    b = b.substring(1);
    nb = true;
  }
  if ((na && !nb) || (!na && nb)) {
    isNegative = true;
  }

  const [, db = ''] = b.split('.');
  if (db.length) {
    const len = db.length;
    const pow = Math.pow(10, len);
    a = multiplyby(a, pow);
    b = multiplyby(b, pow);
  }

  const [, da = ''] = a.split('.');
  if (da.length) {
    const len = da.length;
    const pow = Math.pow(10, len);
    a = multiplyby(a, pow);
    b = multiplyby(b, pow);
  }

  const divide = (x, y) => {
    const uselen = y.length;
    const result = [];

    let waitforcompare = x.substr(0, uselen);
    let waittouse = x.substring(uselen);

    let stillhave = waitforcompare;
    let inrange = 0;

    do {
      let c;
      while ((c = compareby(stillhave, y) >= 0)) {
        if (c > 0) {
          inrange++;
          stillhave = minusby(stillhave, y);
        } else if (c === 0) {
          inrange++;
          stillhave = '';
          break;
        }
      }
      result.push(inrange);
      if (stillhave === '0') {
        stillhave = '';
      }

      const stillhavelen = stillhave.length;
      let nextlen = uselen - stillhavelen;
      nextlen = nextlen > 0 ? nextlen : 1;
      waitforcompare = stillhave + waittouse.substr(0, nextlen);
      waittouse = waittouse.substring(nextlen);

      const leftletters = waitforcompare + waittouse;
      if (/^0+$/.test(leftletters)) {
        result.push(leftletters);
        stillhave = '';
        break;
      }

      stillhave = waitforcompare;
      inrange = 0;
    } while (compareby(stillhave, y) >= 0);

    let remainder = stillhave || '0';
    let quotient = result.join('');

    remainder = clearNum00(remainder);
    quotient = clearNum00(quotient);

    return { remainder, quotient };
  };

  const result = divide(a, b);
  const { remainder, quotient } = result;
  let value = quotient;

  if (remainder && remainder !== '0') {
    let decimalPart = '';
    let nextto = `${remainder}0`;
    while (/[1-9]/.test(nextto)) {
      const dvd = divide(nextto, b);
      const { remainder, quotient } = dvd;
      decimalPart += quotient;

      if (remainder === '0') {
        break;
      }

      nextto = `${remainder}0`;

      if (decimalPart.length >= decimal) {
        break;
      }
    }
    value = `${quotient}.${decimalPart}`;
  }

  value = clearNum00(value);

  if (isNegative) {
    value = `-${value}`;
  }

  return value;
}

/**
 * @param {number|string} a
 * @param {number|string} b
 * @returns {number}
 */
export function compareby(a, b) {
  a = numerify(a);
  b = numerify(b);

  let [ia, da = ''] = a.split('.');
  let [ib, db = ''] = b.split('.');

  const compare2 = (n, m) => {
    if (n.length > m.length) {
      return 1;
    }
    if (n.length < m.length) {
      return -1;
    }

    for (let i = 0, len = n.length; i < len; i++) {
      const nv = n.charAt(i);
      const mv = m.charAt(i);
      if (+nv > +mv) {
        return 1;
      }
      if (+nv < +mv) {
        return -1;
      }
    }
    return 0;
  };

  const compare = (x, y) => {
    const nx = x.indexOf('-') === 0;
    const ny = y.indexOf('-') === 0;

    if (!nx && ny) {
      return 1;
    }
    if (nx && !ny) {
      return -1;
    }
    if (nx && ny) {
      x = x.substring(1);
      y = y.substring(1);
      const result = compare2(x, y);
      return -result;
    }
    if (!nx && !ny) {
      return compare2(x, y);
    }
  };

  const ci = compare(ia, ib);
  if (ci) {
    return ci;
  }

  const dalen = da.length;
  const dblen = db.length;
  const dlen = Math.max(dalen, dblen);
  if (dalen < dlen) {
    da = padRight(da, dlen, '0');
  }
  if (dblen < dlen) {
    db = padRight(db, dlen, '0');
  }
  const cd = compare(da, db);
  if (cd) {
    return cd;
  }

  return 0;
}

/**
 * @param {string} exp
 * @param {number} [decimal]
 * @returns {string}
 */
export function calculate(exp, decimal) {
  const contains = (str, items) => {
    for (let i = 0, len = items.length; i < len; i++) {
      const item = items[i];
      if (str.indexOf(item) > -1) {
        return true;
      }
    }
    return false;
  };

  if (!/^[\(\-]?[0-9]+[0-9\+\-\*\/\(\)]*[0-9\)]$/.test(exp)) {
    throw new Error(`exp contains unexpected content.`);
  }
  if (contains(exp, ['---', '++', '**', '//'])) {
    throw new Error(`exp contains one of ['---', '++', '**', '//'].`);
  }
  if (contains(exp, ['-*', '-/', '+*', '+/'])) {
    throw new Error(`exp contains one of ['-*', '-/', '+*', '+/'].`);
  }
  if (exp.indexOf(')(') > -1) {
    throw new Error(`exp contains ')('.`);
  }
  if (exp.indexOf('()') > -1) {
    throw new Error(`exp contains empty sub-exp '()'.`);
  }
  if (/\)[0-9]/.test(exp)) {
    throw new Error(`exp contains number which follows ')'.`);
  }
  if (/[0-9]\(/.test(exp)) {
    throw new Error(`exp contians '(' which follows number.`);
  }

  const parse = (exp) => {
    let inGroup = 0;
    const exparr = [];
    let expstr = '';
    const groups = [];
    let groupstr = '';
    for (let i = 0, len = exp.length; i < len; i++) {
      const char = exp.charAt(i);
      if (char === '(') {
        if (inGroup) {
          groupstr += char;
        } else {
          if (expstr) {
            exparr.push(expstr);
            expstr = '';
          }
        }
        inGroup++;
      } else if (char === ')') {
        if (!inGroup) {
          throw new Error(`exp has unexpected ')': ... ${groupstr})`);
        }

        if (inGroup === 1) {
          if (groupstr) {
            const index = groups.length;
            exparr.push(index);
            groups.push(groupstr);
            groupstr = '';
          }
        } else {
          groupstr += char;
        }
        inGroup--;
      } else if (inGroup) {
        groupstr += char;
      } else {
        if (/[\+\-\*\/]/.test(char)) {
          if (expstr) {
            exparr.push(expstr);
          }
          expstr = '';
          exparr.push(char);
        } else {
          expstr += char;
        }
      }
    }

    if (inGroup) {
      throw new Error(`exp '(' is not closed.`);
    }

    if (expstr) {
      exparr.push(expstr);
    }

    const exparr2 = [];
    for (let i = 0, len = exparr.length; i < len; i++) {
      const current = exparr[i];
      const prev = exparr[i - 1];
      const next = exparr[i + 1];
      if (current === '-') {
        if (i === 0 || inArray(prev, ['*', '/', '+', '-'])) {
          if (next === '-') {
            i++;
            continue;
          } else if (next === '+') {
            const nextnext = exparr[i + 2];
            const text = `-${nextnext}`;
            exparr2.push(text);
            i += 2;
          } else {
            const text = `-${next}`;
            exparr2.push(text);
            i++;
          }
        } else {
          exparr2.push(current);
        }
      } else {
        exparr2.push(current);
      }
    }

    const expsrc = [];
    exparr2.forEach((item, i) => {
      if (isNumber(item)) {
        item = groups[item];
        item = parse(item);
      }
      expsrc.push(item);
    });

    let expast = [];

    if (contains(exp, ['+', '-']) && contains(exp, ['*', '/'])) {
      let combine = [];
      let started = false;
      for (let i = 0; i < expsrc.length; i++) {
        const current = expsrc[i];
        if (!started && (current === '*' || current === '/')) {
          const prev = expast.pop();
          combine.push(prev);
          combine.push(current);
          started = true;
        } else if (started) {
          if (current === '+' || (!inArray(combine[combine.length - 1], ['*', '/']) && current === '-')) {
            expast.push(combine);
            expast.push(current);
            started = false;
            combine = [];
          } else if (i === expsrc.length - 1) {
            combine.push(current);
            expast.push(combine);
            started = false;
            combine = [];
          } else {
            combine.push(current);
          }
        } else {
          expast.push(current);
        }
      }
    } else {
      expast = expsrc;
    }

    return expast;
  };

  const execute = (expast) => {
    const exparr = [];
    expast.forEach((item) => {
      if (isArray(item)) {
        item = execute(item);
      }
      exparr.push(item);
    });

    let expres = [];
    const leftres = [];
    const rightres = [];
    for (let i = 0, len = exparr.length; i < len; i++) {
      const current = exparr[i];
      const next = exparr[i + 1];
      if (current === '*') {
        leftres.push(current);
        leftres.push(next);
        i++;
      } else if (current === '/') {
        rightres.push(current);
        rightres.push(next);
        i++;
      } else {
        expres.push(current);
      }
    }
    expres = expres.concat(leftres).concat(rightres);

    let result = '';
    for (let i = 0, len = expres.length; i < len; i++) {
      const current = expres[i];
      if (i === 0) {
        result = current === '-' ? '0' : current;
      }
      if (/[\+\-\*\/]/.test(current)) {
        const next = expres[i + 1];
        if (current === '+') {
          result = plusby(result, next);
        } else if (current === '-') {
          result = minusby(result, next);
        } else if (current === '*') {
          result = multiplyby(result, next);
        } else if (current === '/') {
          result = divideby(result, next, decimal);
        }
      }
    }

    return result;
  };

  const expast = parse(exp);
  const result = execute(expast);
  return result;
}

/**
 * @param {number|string} input
 * @param {number} [decimal]
 * @param {boolean} [pad]
 * @param {boolean} [floor]
 * @returns {string}
 */
export function fixNum(input, decimal = 2, pad = false, floor = false) {
  const num = parseFloat(input);
  if (isNaN(num)) {
    return '';
  }

  let value = numerify(input);
  let [integerPart, decimalPart = ''] = value.split('.');

  const plusOneToTail = (dnum) => {
    const [integerPart, decimalPart] = dnum.split('.');
    const dlen = decimalPart.length;
    const one = `0.${padLeft('1', dlen, '0')}`;
    const value = plusby(dnum, one);
    return value;
  };

  if (decimal === 0 && floor) {
    if (decimalPart && num < 0) {
      integerPart = minusby(integerPart, '1');
    }
    value = integerPart;
  } else if (decimal === 0) {
    if (decimalPart && +`0.${decimalPart}` >= 0.5) {
      if (num >= 0) {
        integerPart = plusby(integerPart, '1');
      } else {
        integerPart = minusby(integerPart, '1');
      }
    }
    value = integerPart;
  } else if (decimal > 0 && floor) {
    const isNegative = num < 0;
    if (decimalPart) {
      if (isNegative) {
        let usePart = decimalPart.substring(0, decimal);
        const dropPart = decimalPart.substring(decimal);

        usePart = `0.${usePart}`;

        if (dropPart) {
          usePart = plusOneToTail(usePart);
        }

        value = minusby(integerPart, usePart);
      } else {
        value = `${integerPart}.${decimalPart.substring(0, decimal)}`;
      }
    } else {
      value = integerPart;
    }
  } else if (decimal > 0) {
    value = integerPart;
    if (decimalPart) {
      let usePart = decimalPart.substring(0, decimal);
      const dropPart = decimalPart.substring(decimal, decimal + 1);

      usePart = `0.${usePart}`;

      if (+dropPart >= 5) {
        usePart = plusOneToTail(usePart);
      }

      const isNegative = num < 0;
      if (isNegative) {
        value = minusby(integerPart, usePart);
      } else {
        value = plusby(integerPart, usePart);
      }
    }
  }

  value = clearNum00(value);

  if (pad) {
    let [integerPart, decimalPart = ''] = value.split('.');
    if ((decimalPart && decimalPart.length < decimal) || !decimalPart) {
      decimalPart = padRight(decimalPart || '', decimal, '0');
      value = `${integerPart}.${decimalPart}`;
    }
  }

  return value;
}

/**
 * @param {number|string} input
 * @param {string} separator
 * @param {number} count
 * @param {boolean} [formatdecimal]
 * @returns {string}
 */
export function formatNum(input, separator, count, formatdecimal = false) {
  if (!input) {
    return '';
  }

  const num = input.toString();

  if (!/^\-{0,1}[0-9]+(\.{0,1}[0-9]+){0,1}$/.test(num)) {
    return '';
  }

  const blocks = num.split(/\-|\./);
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

  integer = formatString(integer, separator, count, true);
  if (formatdecimal && decimal) {
    decimal = formatString(decimal, separator, count);
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
 * @param {number|string} input
 * @param {boolean} [formatdecimal]
 * @returns {string}
 */
export function formatNum1000(input, formatdecimal = false) {
  return formatNum(input, ',', 3, formatdecimal);
}

// http://www.softwhy.com/article-4813-1.html
/**
 * @param {number|string} num
 * @returns {string}
 */
export function num10to62(num) {
  const chars = CHARS.split('');
  const radix = chars.length;
  const arr = [];
  let qutient = +num;
  do {
    const mod = qutient % radix;
    qutient = (qutient - mod) / radix;
    arr.unshift(chars[mod]);
  } while (qutient);
  const code = arr.join('');
  return code;
}

/**
 * @param {string} code
 * @returns {number}
 */
export function num62to10(code) {
  const radix = CHARS.length;
  const len = code.length;
  let i = 0;
  let num = 0;
  while (i < len) {
    num += Math.pow(radix, i++) * CHARS.indexOf(code.charAt(len - i) || 0);
  }
  return num;
}
