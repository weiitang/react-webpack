/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/naming-convention */

/**
 * core内部使用的utils
 */

import {
  createProxy,
  isFunction,
  isObject,
  isEqual,
  isArray,
  isString,
  each,
  isInstanceOf,
  getConstructorOf,
  parse,
  mixin,
  isConstructor,
  isInheritedOf,
  define,
} from 'ts-fns';
import produce from 'immer';
import type { ConstructorOf } from '@src/typings/utils';
import { isValidElement } from 'react';
// import { isSource } from 'algeb';
import { Stream } from '../stream';

/**
 * noop
 */
export function noop() {}

export const createProxyHandler = (data, receive) => ({
  receive(keyPath, value, fn, args) {
    if (!fn) {
      receive(keyPath, value);
    } else {
      const arr = parse(data, keyPath);
      const next = produce(arr, (arr) => {
        arr[fn](...args);
      });
      receive(keyPath, next);
    }
  },
  writable() {
    return false;
  },
  disable(_, value) {
    return isValidElement(value) || isRef(value);
  },
});

/**
 * @param {object} data
 * @param {function} updator (data, key, value) => void
 * @param {boolean} [formalized] whether to generate formalized two-way-binding like [value, update]
 */
export function createTwoWayBinding(data, updator, formalized?) {
  const traps = createProxyHandler(data, (keyPath, value) => {
    if (!formalized) {
      updator(value, keyPath, data);
    }
  });
  const proxy = createProxy(data, {
    ...traps,
    get(keyPath, value) {
      return formalized
        ? [value, (value) => updator(value, keyPath, data)]
        : value;
    },
  });
  return proxy;
}

export function ensureTwoWayBinding(origin, binding) {
  return new Proxy(origin, {
    // eslint-disable-next-line no-param-reassign
    get: (_, key) => [origin[key], (value) => (binding[key] = value)],
    set: () => false,
    deleteProperty: () => false,
  });
}

export function createPlaceholderElement(placeholder) {
  if (isFunction(placeholder)) {
    return placeholder();
  }

  return placeholder || null;
}

export function isShallowEqual(objA, objB, isEqaul?) {
  if (objA === objB) {
    return true;
  }

  if (typeof objA !== 'object' || typeof objB !== 'object') {
    return objA === objB;
  }

  if (objA === null || objB === null) {
    return objA === objB;
  }

  if ((isArray(objA) && !isArray(objB)) || (isArray(objB) && !isArray(objA))) {
    return false;
  }

  const keysA = Object.keys(objA).sort();
  const keysB = Object.keys(objB).sort();

  // two empty object
  if (!keysA.length && !keysB.length) {
    return true;
  }

  if (keysA.length !== keysB.length) {
    return false;
  }

  for (let i = 0; i < keysA.length; i++) {
    const keyA = keysA[i];
    const keyB = keysB[i];

    if (keyA !== keyB) {
      return false;
    }
    if (isEqaul) {
      if (!isEqaul(objA[keyA], objB[keyB])) {
        return false;
      }
    } else if (objA[keyA] !== objB[keyB]) {
      return false;
    }
  }

  return true;
}

export function isRef(obj) {
  return obj && isObject(obj) && isEqual(Object.keys(obj), ['current']);
}

export function camelCase(str) {
  const items = str.split(/\W|_/).filter((item) => item);
  const text = items.reduce(
    (text, curr) => text + curr.replace(curr[0], curr[0].toUpperCase())
  );
  return text;
}

export class PrimitiveBase {
  private __inited: boolean;

  constructor() {
    this.__init();
    this.__inited = true;
    each(this, (value, key) => {
      if (isObject(value) && value.$$type === 'offer' && value.getter) {
        this[key] = value.getter();
      }
    });
    this.init();
  }

  protected __init() {}

  protected init() {}

  protected destroy() {}

  offer<T>(getter: () => T): T {
    if (!this.__inited) {
      // @ts-ignore
      return { $$type: 'offer', getter };
    }
    return getter();
  }

  destructor() {
    this.destroy();
    each(this, (value, key) => {
      if (isInstanceOf(value, Stream)) {
        value.complete();
        this[key] = null;
      }
      // auto destroy refer objects, if it is a single instance, it will trigger its static destroy
      else if (value && isInstanceOf(value, PrimitiveBase)) {
        value.destructor();
        this[key] = null;
      }
    });
  }

  new<T extends this>(): T {
    const Constructor = getConstructorOf(this);
    return new Constructor();
  }

  static implement(protos) {
    mixin(this, protos);
    return this;
  }
}

export class SingleInstance extends PrimitiveBase {
  isDied: boolean;

  destructor() {
    // destroy single instance
    const Constructor = getConstructorOf(this);
    if (Constructor.__instance === this) {
      Constructor.destructor();
      this.isDied = Constructor.__instanced <= 0;
    } else {
      this.isDied = true;
    }

    this.destroy();

    if (this.isDied) {
      each(this, (value, key) => {
        if (isInstanceOf(value, Stream)) {
          value.complete();
          this[key] = null;
        }
        // auto destroy refer objects, if it is a single instance, it will trigger its static destroy
        else if (
          value &&
          isFunction(value.destructor) &&
          !value.destructor.length
        ) {
          value.destructor();
          this[key] = null;
        }
      });
    }
  }

  private static __instanced: number;
  private static __instance: any;
  private static __instanceDefer;

  static instance<T>(this: ConstructorOf<T>): T {
    const Constructor = this;

    // @ts-ignore
    Constructor.__instanced = Constructor.__instanced || 0;
    // @ts-ignore
    // eslint-disable-next-line no-plusplus
    Constructor.__instanced++;

    // @ts-ignore
    if (Constructor.__instance) {
      // @ts-ignore
      return Constructor.__instance;
    }

    // @ts-ignore
    if (Constructor.__instanceDefer) {
      // @ts-ignore
      clearTimeout(Constructor.__instanceDefer);
    }
    const instance = new Constructor() as unknown as T;
    // @ts-ignore
    Constructor.__instance = instance;
    return instance;
  }

  static destructor() {
    const Constructor = this;

    Constructor.__instanced = Constructor.__instanced || 0;
    if (Constructor.__instanced) {
      // eslint-disable-next-line no-plusplus
      Constructor.__instanced--;
    }

    if (Constructor.__instance && Constructor.__instanced <= 0) {
      // delay delete, because we may create a instance in a short time
      Constructor.__instanceDefer = setTimeout(() => {
        Constructor.__instance = null;
      }, 32);
    }
  }
}

export function parseClassNames(classNames, cssRules) {
  let items = [];
  if (isString(classNames)) {
    items = classNames
      .split(' ')
      .filter(Boolean)
      .map((className) => {
        if (cssRules[className]) {
          return cssRules[className];
        }

        const key = camelCase(className);
        if (cssRules[key]) {
          return cssRules[key];
        }

        // use self
        return className;
      });
  } else if (isArray(classNames)) {
    items = classNames
      .map((item) => (isString(item) ? parseClassNames(item, cssRules) : item))
      .filter((item) => item && (isString(item) || typeof item === 'object'))
      .reduce((items, item) => {
        if (isArray(item)) {
          items.push(...item);
        } else {
          items.push(item);
        }
        return items;
      }, []);
  }

  // return stylesheet with objects
  // only used when passed into `stylesheet` of internal components
  // i.e. <Section stylesheet={this.css('some-1 some-2')}></Section>
  if (items.some((item) => isObject(item))) {
    return items;
  }

  // return string class list
  // only used in DOM
  return items.join(' ');
}

export function findInfoByMapping(
  data: object,
  mapping: {
    [key: string]: string | string[] | boolean;
  } = {}
) {
  const keys = Object.keys(mapping);
  const found = {};
  const notFound = [];

  keys.forEach((key) => {
    const fromKey = mapping[key];
    let flag = false;
    // 支持多个，从多个里面找一个
    if (isArray(fromKey)) {
      for (let i = 0, len = (fromKey as []).length; i < len; i++) {
        const mayBe = fromKey[i];
        if (mayBe in data) {
          found[key] = data[mayBe];
          flag = true;
          break;
        }
      }
    } else if (isString(fromKey)) {
      if ((fromKey as string) in data) {
        found[key] = data[fromKey as string];
        flag = true;
      }
    } else if (fromKey === true) {
      if (key in data) {
        found[key] = data[key];
        flag = true;
      }
    }
    // 如果配置为false，表示该key可以不存在，也可以存在，存在时使用它
    else if (fromKey === false) {
      if (key in data) {
        found[key] = data[key];
      }
      flag = true;
    }
    if (!flag) {
      notFound.push(key);
    }
  });

  return { found, notFound };
}

/**
 * 获取全部static属性
 * @param fromConstructor
 * @param topConstructor
 * @returns
 */
export function ofChainStatic(fromConstructor, topConstructor) {
  const properties = {};
  const push = (target) => {
    // if it is not a Constructor
    if (!isConstructor(target)) {
      // eslint-disable-next-line no-param-reassign
      target = getConstructorOf(target);
    }

    if (target === topConstructor) {
      return;
    }

    each(
      target,
      (descriptor, key) => {
        if (!Object.getOwnPropertyDescriptor(properties, key)) {
          const prop = key.indexOf('$_') === 0 ? key.substring(2) : key;
          if (prop.indexOf('_') === 0) {
            return;
          }
          define(properties, prop, descriptor);
        }
      },
      true
    );

    // to parent
    const Parent = getConstructorOf(target.prototype);
    if (isInheritedOf(Parent, topConstructor)) {
      push(target.prototype);
    }
  };
  push(fromConstructor);
  return properties;
}
