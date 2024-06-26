/* eslint-disable no-param-reassign */
import {
  getConstructorOf,
  each,
  define,
  isInheritedOf,
  isConstructor,
  isArray,
  isObject,
  isString,
  makeKeyChain,
  isNumeric,
  isNumber,
} from 'ts-fns';

export function traverseChain(Target, TopConstructor, fn) {
  const traverse = (Target) => {
    // if it is a Constructor
    if (!isConstructor(Target)) {
      Target = getConstructorOf(Target);
    }

    if (Target === TopConstructor) {
      return;
    }

    fn(Target);

    // to parent
    const Parent = getConstructorOf(Target.prototype);
    if (isInheritedOf(Parent, TopConstructor)) {
      traverse(Target.prototype);
    }
  };
  traverse(Target);
}

export function ofChain(target, TopConstructor, excludes = []) {
  const properties = {};
  const Target = getConstructorOf(target);
  traverseChain(Target, TopConstructor, (Meet) => {
    each(
      Meet,
      (descriptor, key) => {
        if (key.indexOf('_') === 0) {
          return;
        }
        if (excludes.includes(key)) {
          return;
        }
        if (!Object.getOwnPropertyDescriptor(properties, key)) {
          const prop = key.indexOf('$') === 0 ? key.substring(2) : key;
          define(properties, prop, descriptor);
        }
      },
      true
    );
  });
  return properties;
}

export function tryGet(get, use) {
  try {
    return get();
  } catch (e) {
    return use;
  }
}

export function makeMsg(errs) {
  const errors = errs.filter((item) => item);
  if (errors.length) {
    errors.message = errors[0].message;
  }
  return errors;
}

export function patchObj(source, input) {
  each(input, (value, key) => {
    const src = source[key];
    if (isArray(src) && isArray(value)) {
      src.push(...value);
    } else if (isObject(src) && isObject(value)) {
      patchObj(src, value);
    } else {
      source[key] = value;
    }
  });
}

export function createAsyncRef(defaultValue, getter, deps) {
  const ref = {
    current: defaultValue,
    deferer: null,
    getter,
    deps,
    $$type: 'asyncRef',
    attach(...args) {
      if (ref.deferer) {
        return ref.deferer;
      }

      const deferer = Promise.resolve()
        .then(() => getter.call(this, ...args))
        .then((next) => {
          ref.current = next;
          return next;
        });
      ref.deferer = deferer;
      // use it in one microtask
      Promise.resolve().then(() => {
        ref.deferer = null;
      });
      return deferer;
    },
  };
  return ref;
}

export function isAsyncRef(ref) {
  return isObject(ref) && ref.$$type === 'asyncRef';
}

export function createMemoRef(getter, compare, depend) {
  const ref = {
    $$type: 'memoRef',
    getter,
    compare,
    depend,
  };
  return ref;
}

export function isMemoRef(ref) {
  return isObject(ref) && ref.$$type === 'memoRef';
}

export function isKeyPathEqual(keyPath1, keyPath2) {
  if (isString(keyPath1) && isString(keyPath2)) {
    return keyPath1 === keyPath2;
  }

  const key1 = isArray(keyPath1) ? [...keyPath1] : makeKeyChain(keyPath1);
  const key2 = isArray(keyPath2) ? [...keyPath2] : makeKeyChain(keyPath2);

  const len = Math.max(key1.length, key2.length);

  for (let i = 0; i < len; i++) {
    const path1 = key1[i];
    const path2 = key2[i];

    if (path1 === path2) {
      continue;
    }

    if (isNumeric(path1) && isNumber(path2) && path1 === `${path2}`) {
      continue;
    }

    if (isNumeric(path2) && isNumber(path1) && path2 === `${path1}`) {
      continue;
    }

    return false;
  }

  return true;
}

export function onlySupportLegacy(target) {
  // new version of decorators
  if (target && target[Symbol.toStringTag] === 'Descriptor') {
    throw new Error(
      `TySheMo: decorators only support legacy(stage 1) version.`
    );
  }
}
