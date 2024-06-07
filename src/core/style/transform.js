import { dict, ifexist, enumerate, tuple } from 'tyshemo';
import { each, isString, isArray, isObject } from 'ts-fns';

const TranslateType = enumerate([String, Number]);
const ParamsType = dict({
  rotate: ifexist(String),
  rotateX: ifexist(String),
  rotateY: ifexist(String),
  rotateZ: ifexist(String),
  scale: ifexist(String),
  scaleX: ifexist(String),
  scaleY: ifexist(String),
  translate: ifexist(tuple([TranslateType, TranslateType])),
  translateX: ifexist(TranslateType),
  translateY: ifexist(TranslateType),
  skew: ifexist(tuple([String, String])),
  skewX: ifexist(String),
  skewY: ifexist(String),
});

export class Transform {
  constructor(rules = {}) {
    this.rules = { ...rules };
  }

  set(rules) {
    if (process.env.NODE_ENV !== 'production') {
      ParamsType.assert(rules);
    }
    Object.assign(this.rules, rules);
    return this;
  }
  del(rules) {
    each(rules, (value, key) => {
      if (!value) {
        return;
      }
      delete this.rules[key];
    });
    return this;
  }
  get() {
    const { rules } = this;
    const convert = (v) => (isNumber(v) ? `${parseInt(v, 10)}px` : v);

    let text = '';
    each(rules, (value, key) => {
      const v = isArray(value) ? value.map(convert).join(', ') : convert(value);
      text += `${key}(${v}) `;
    });

    return text;
  }

  static parse(value) {
    const rules = {};
    // array in native
    if (isArray(value)) {
      value.forEach((item) => {
        Object.assign(rules, item);
      });
      return rules;
    }
    // is a object
    if (isObject(value)) {
      return value;
    }
    // string in web
    if (isString(value)) {
      const blocks = value.split(' ').filter((item) => !!item);
      blocks.forEach((item) => {
        const [name, x, y] = item.split(/[(,)]/).map((item) => item.trim());
        rules[name] = y ? [x, y] : x;
      });
    }
    return rules;
  }

  static generate(rules) {
    const trans = new Transform(rules);
    const res = trans.get();
    return res;
  }

  static convert(value) {
    const obj = Transform.parse(value);
    const rule = Transform.generate(obj);
    return rule;
  }
}
export default Transform;
