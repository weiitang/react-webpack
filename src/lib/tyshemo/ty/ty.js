/* eslint-disable @typescript-eslint/no-this-alias */
import { isFunction, isArray, isConstructor, isObject, createProxy, isInstanceOf, assign } from 'ts-fns';

import { onlySupportLegacy } from '../shared/utils.js';
import { createType } from './rules.js';
import { Tupl } from './tuple.js';

export class Ty {
  constructor() {
    this._listeners = [];
    this._silent = false;
  }

  bind(fn) {
    if (isFunction(fn)) {
      this._listeners.push(fn);
    }
    return this;
  }
  unbind(fn) {
    this._listeners.forEach((item, i) => {
      if (item === fn) {
        this._listeners.splice(i, 1);
      }
    });
    return this;
  }
  dispatch(error) {
    this._listeners.forEach((fn) => {
      Promise.resolve().then(() => fn.call(this, error));
    });
    return this;
  }

  silent(value) {
    this._silent = !!value;
  }
  throw(error) {
    if (this._translate && error.translate) {
      error.translate(this._translate);
    }

    this.dispatch(error);

    if (!this._silent) {
      throw error;
    }
  }
  try(fn, translate) {
    this._translate = translate;
    fn();
    this._translate = null;
  }

  /**
   * @example
   * ty.expect(10).to.match(Number)
   */
  expect(value) {
    return {
      to: {
        match: (_type) => {
          const type = createType(_type);
          try {
            type.assert(value);
            return true;
          } catch (e) {
            this.throw(e);
            return false;
          }
        },
        be: (type) => this.expect(value).to.match(type),
      },
    };
  }

  /**
   * @example
   * let error = ty.catch(10).by(Number)
   */
  catch(value) {
    return {
      by: (_type) => {
        const type = createType(_type);
        const error = type.catch(value);
        if (error) {
          this.dispatch(error);
        }
        return error;
      },
    };
  }

  /**
   * @example
   * ty.trace('10').by(Number)
   */
  trace(value) {
    return {
      by: (_type) => {
        const type = createType(_type);
        return type.trace(value).catch((error) => this.throw(error));
      },
    };
  }

  /**
   * @example
   * ty.track('10').by(Number)
   */
  track(value) {
    return {
      by: (_type) => {
        const type = createType(_type);
        return type.track(value).catch((error) => this.throw(error));
      },
    };
  }

  /**
   * determine whether type match
   * @example
   * let bool = ty.is(Number).typeof(10)
   * let bool = ty.is(10).of(Number)
   */
  is(arg) {
    return {
      typeof: (value) => {
        const type = createType(arg);
        const error = type.catch(value);
        if (error) {
          this.dispatch(error);
        }
        return !error;
      },
      of: (type) => this.is(type).typeof(arg),
    };
  }

  /**
   * @param {string|undefined} which input|output
   * @example
   * @ty.decorate('input').with((value) => SomeType.assert(value))
   */
  get decorate() {
    const $this = this;
    function wrap(title, target, ...types) {
      const [type, type2] = types;
      const chekcer = createType(type, null, true);

      const check = () => {
        $this.try(() => $this.expect(target).to.be(chekcer), `{keyPath} should match {should} but receive {receive}`);
      };

      if (isObject(target)) {
        const proxy = createProxy(target, {
          set(keyPath, value) {
            assign(target, keyPath, value);
            check();
            return value;
          },
        });
        return proxy;
      }
      if (isArray(target)) {
        const proxy = createProxy(target, {
          set(keyPath, value) {
            assign(target, keyPath, value);
            check();
            return value;
          },
          push(keyPath, items) {
            if (keyPath.length) {
              return;
            }
            $this.try(
              () => $this.expect(items).to.be(type),
              `push items {keyPath} should match {should} but receive {receive}`,
            );
          },
          splice(keyPath, [_start, _end, ...items]) {
            if (!keyPath.length && items.length) {
              $this.try(
                () => $this.expect(items).to.be(type),
                `splice insert items {keyPath} should match {should} but receive {receive}`,
              );
            }
          },
          fill(keyPath, [value, _start, _end]) {
            if (keyPath.length) {
              return;
            }
            $this.try(
              () => $this.expect([value]).to.be(type),
              `fill value should match {should} but receive {receive}`,
            );
          },
        });
        return proxy;
      }
      // isConstructor should must come before isFunction
      if (isConstructor(target, 2)) {
        return class extends target {
          constructor(...args) {
            const tupl = isInstanceOf(type, Tupl) ? type : new Tupl(type);
            $this.try(
              () => $this.expect(args).to.be(tupl),
              `${target.name} constructor parameters should match {should} but receive {receive}`,
            );
            super(...args);
          }
        };
      }
      if (isFunction(target)) {
        const tupl = isInstanceOf(type, Tupl) ? type : new Tupl(type);
        return function (...args) {
          $this.try(
            () => $this.expect(args).to.be(tupl),
            `${title} parameters {keyPath} should match {should} but receive {receive}`,
          );
          const result = target.apply(this, args);
          $this.try(
            () => $this.expect(result).to.be(type2),
            `${title} returns should match {should} but receive {receive}`,
          );
          return result;
        };
      }

      $this.expect(target).to.be(type);
      return target;
    }
    function describe(...types) {
      return (target, prop, descriptor) => {
        onlySupportLegacy(target);

        const [type] = types;
        // decorate class constructor
        if (target && !prop) {
          return wrap(`${target.constructor.name}.constructor`, target, ...types);
        }
        // decorate class member
        if (target && prop) {
          // computed property with setter
          if (descriptor.set || descriptor.get) {
            const get = descriptor.get
              ? wrap(`${target.constructor.name}.${prop} getter`, descriptor.get, [], type)
              : void 0;
            const set = descriptor.set
              ? wrap(`${target.constructor.name}.${prop} setter`, descriptor.set, [type])
              : void 0;
            return {
              ...descriptor,
              set,
              get,
            };
          }
          // function method
          if (descriptor.writable && isFunction(descriptor.value)) {
            return {
              ...descriptor,
              value: wrap(`${target.constructor.name}.${prop}`, descriptor.value, ...types),
            };
          }
          // normal property with initializer
          if (descriptor.writable && descriptor.initializer) {
            let value = descriptor.initializer();
            $this.try(
              () => $this.expect(value).to.be(type),
              `${target.name}.${prop} should be {should} but receive {receive}`,
            );
            return {
              enumerable: descriptor.enumerable,
              configurable: descriptor.configurable,
              set: (v) => {
                $this.try(
                  () => $this.expect(v).to.be(type),
                  `${target.name}.${prop} should be {should} but receive {receive}`,
                );
                value = v;
              },
              get: () => value,
            };
          }
          // normal property
          if (descriptor.writable) {
            let { value } = descriptor;
            return {
              enumerable: descriptor.enumerable,
              configurable: descriptor.configurable,
              set: (v) => {
                $this.try(
                  () => $this.expect(v).to.be(type),
                  `${target.name}.${prop} should be {should} but receive {receive}`,
                );
                value = v;
              },
              get: () => value,
            };
          }

          return descriptor;
        }

        return descriptor;
      };
    }
    function decorate(source) {
      return {
        with: (...types) => wrap(`function ${source.name}`, source, ...types),
      };
    }
    decorate.with = (...types) => describe(...types);
    return decorate;
  }
}

const ty = new Ty();

Ty.expect = ty.expect.bind(ty);
Ty.catch = ty.catch.bind(ty);
Ty.trace = ty.trace.bind(ty);
Ty.track = ty.track.bind(ty);
Ty.is = ty.is.bind(ty);
Ty.create = createType;
Object.defineProperty(Ty, 'decorate', { get: () => ty.decorate });
