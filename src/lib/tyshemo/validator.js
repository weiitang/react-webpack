/* eslint-disable */

import {
  isEmpty,
  isNumber,
  isNumeric,
  isString,
  isConstructor,
  isFunction,
  isInstanceOf,
  isBoolean,
  isNaN,
  numerify,
  getConstructorOf,
} from 'ts-fns';
import { ofChain } from './shared/utils.js';

export class Validator {
  constructor(attrs = {}) {
    const properties = ofChain(this, Validator);
    Object.assign(this, properties, attrs);
  }

  extend(attrs) {
    const Constructor = getConstructorOf(this);
    const validator = new Constructor(this);
    Object.assign(validator, attrs);
    return validator;
  }

  static required = required;
  static maxLen = maxLen;
  static minLen = minLen;
  static max = max;
  static min = min;

  static integer = integer;
  static decimal = decimal;
  static email = email;
  static url = url;
  static date = date;
  static match = match;
  static allOf = allOf;
  static anyOf = anyOf;
}

function required(message, emptyFn) {
  return new Validator({
    name: 'required',
    determine(_, key) {
      if (this?.$views?.[key]) {
        return this.$views[key].required;
      }
      return true;
    },
    validate(value, key) {
      // emptyFn has higher priority
      if (emptyFn) {
        if (this) {
          return !emptyFn.call(this, value);
        }
        return !emptyFn(value);
      }
      if (this?.$views?.[key]) {
        return !this.$views[key].empty;
      }
      return !isEmpty(value);
    },
    message,
    break: true,
  });
}

function maxLen(message, len) {
  return new Validator({
    name: 'maxLen',
    determine(_, key) {
      if (isNumber(len)) {
        return true;
      }
      if (isNumber(this?.$views?.[key]?.maxLen)) {
        return true;
      }
      return false;
    },
    validate(value, key) {
      if (!isString(value)) {
        return false;
      }

      const attr = this?.$views?.[key]?.maxLen;
      const maxNum = isNumber(len) ? len : isNumber(attr) ? attr : NaN;
      return value.length <= maxNum;
    },
    message,
    break: true,
  });
}

function minLen(message, len) {
  return new Validator({
    name: 'minLen',
    determine(_, key) {
      if (isNumber(len)) {
        return true;
      }
      if (isNumber(this?.$views?.[key]?.minLen)) {
        return true;
      }
      return false;
    },
    validate(value, key) {
      if (!isString(value)) {
        return false;
      }

      const attr = this?.$views?.[key]?.minLen;
      const minNum = isNumber(len) ? len : isNumber(attr) ? attr : NaN;
      return value.length >= minNum;
    },
    message,
    break: true,
  });
}

function max(message, num) {
  return new Validator({
    name: 'max',
    determine(_, key) {
      if (isNumber(num)) {
        return true;
      }
      if (isNumber(this?.$views?.[key]?.max)) {
        return true;
      }
      return false;
    },
    validate(value, key) {
      if (isNumber(value) || isNumeric(value)) {
        const v = +value;
        const attr = this?.$views?.[key]?.max;
        const n = isNumber(num) ? num : isNumber(attr) ? attr : NaN;
        return v <= n;
      }
      return false;
    },
    message,
    break: true,
  });
}

function min(message, num) {
  return new Validator({
    name: 'min',
    determine(_, key) {
      if (isNumber(num)) {
        return true;
      }
      if (isNumber(this?.$views?.[key]?.min)) {
        return true;
      }
      return false;
    },
    validate(value, key) {
      if (isNumber(value) || isNumeric(value)) {
        const v = +value;
        const attr = this?.$views?.[key]?.min;
        const n = isNumber(num) ? num : isNumber(attr) ? attr : NaN;
        return v >= n;
      }
      return false;
    },
    message,
    break: true,
  });
}

function integer(message, len) {
  return new Validator({
    name: 'integer',
    determine(_, key) {
      if (isNumber(len)) {
        return true;
      }
      if (isNumber(this?.$views?.[key]?.integer)) {
        return true;
      }
      return false;
    },
    validate(value, key) {
      if (!isNumber(value) && !isNumeric(value)) {
        return false;
      }

      const num = numerify(value).replace('-', '');
      const [intPart] = num.split('.');
      const integer = this?.$views?.[key]?.integer;
      const limit = isNumber(len) ? len : isNumber(integer) ? integer : null;

      if (limit === null) {
        return true;
      }

      if (intPart.length > limit) {
        return false;
      }

      return true;
    },
    message,
    break: true,
  });
}

function decimal(message, len) {
  return new Validator({
    name: 'decimal',
    determine(_, key) {
      if (isNumber(len)) {
        return true;
      }
      if (isNumber(this?.$views?.[key]?.decimal)) {
        return true;
      }
      return false;
    },
    validate(value, key) {
      if (!isNumber(value) && !isNumeric(value)) {
        return false;
      }

      const num = numerify(value).replace('-', '');
      const [, deciPart = ''] = num.split('.');
      const decimal = this?.$views?.[key]?.decimal;
      const limit = isNumber(len) ? len : isNumber(decimal) ? decimal : null;

      if (limit === null) {
        return true;
      }

      if (deciPart.length > limit) {
        return false;
      }

      return true;
    },
    message,
    break: true,
  });
}

function email(message) {
  return match(
    /^[A-Za-z0-9]+[A-Za-z0-9._]*[A-Za-z0-9]+@[A-Za-z0-9]+[A-Za-z0-9.-]*[A-Za-z0-9]+\.[A-Za-z]{2,8}$/,
    message,
    'email',
  );
}

function url(message) {
  return match(/http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- ./?%&=]*)?/, message, 'url');
}

function date(message) {
  return match(/^[1-2][0-9]{3}-[0-1][0-9]-[0-3][0-9]/, message, 'date');
}

function match(validator, message, name = 'match') {
  return new Validator({
    name,
    validate(value) {
      if (isInstanceOf(validator, RegExp)) {
        return typeof value === 'string' && validator.test(value);
      }
      if (validator === String) {
        return isString(value);
      }
      if (validator === Number) {
        return isNumber(value);
      }
      if (validator === Boolean) {
        return isBoolean(value);
      }
      if (validator === Function) {
        return typeof value === 'function';
      }
      if (isNaN(validator)) {
        return isNaN(value);
      }
      // isConstructor should must come before isFunction
      if (isConstructor(validator, 2)) {
        return isInstanceOf(value, validator);
      }
      if (isFunction(validator)) {
        return validator.call(this, value);
      }

      return validator === value;
    },
    message,
    break: true,
  });
}

function allOf(validators, message) {
  return new Validator({
    name: 'allOf',
    validate(value) {
      for (let i = 0, len = validators.length; i < len; i++) {
        const validate = validators[i];
        if (!validate.call(this, value)) {
          return false;
        }
      }
      return true;
    },
    message,
    break: true,
  });
}

function anyOf(validators, message) {
  return new Validator({
    name: 'anyOf',
    validate(value) {
      for (let i = 0, len = validators.length; i < len; i++) {
        const validate = validators[i];
        if (validate.call(this, value)) {
          return true;
        }
      }
      return false;
    },
    message,
    break: true,
  });
}
