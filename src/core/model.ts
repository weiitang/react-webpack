import { Model, type EditorModel, Meta, Validator } from 'tyshemo';
import { ConstructorOf } from '@typings/utils';
import { useEffect, useMemo } from 'react';
import { useForceUpdate } from '@src/hook';
import { isNone, isArray } from 'ts-fns';
import { useShallowLatest } from '@src/hook';

const PropertiesInWhiteListSymbol = Symbol('policies');
const PropertiesReadonlyListSymbol = Symbol('readonlyList');
const OriginalEdit = Model.Edit;
const OriginalScene = Model.Scene;
function Edit<T>(
  this: ConstructorOf<T>,
  mapping?: { [key: string]: string }
): ConstructorOf<T & EditorModel> & typeof MaBaseModel {
  const MaEditorModel = OriginalEdit.call(this);
  const { fromJSON, fromJSONPatch } = MaEditorModel.prototype;
  Object.assign(MaEditorModel.prototype, {
    _takeOverrideAttrs() {
      const schema = this.$schema;
      const attrs = [];
      const fields = Object.keys(schema);
      fields.forEach((key) => {
        const meta = schema[key];

        const { available, asset, debug, readonly } = meta;
        const item = {
          meta,
          attrs: {
            available(value, key) {
              /**
               * 字段白名单，不在该白名单内的字段available为false
               */
              const { list: propertiesInWhiteList, mapping } =
                this[PropertiesInWhiteListSymbol] || {};
              const whiteAlias = mapping?.[key];
              const whiteName = whiteAlias || asset || key;
              let visibile = true;
              let reason = '';
              // 如果返回的edit数据中不存在whiteProperties，代表该数据没有查看和编辑的权限，直接跳过当前权限判断逻辑
              if (
                propertiesInWhiteList &&
                !propertiesInWhiteList.includes(whiteName)
              ) {
                visibile = false;
                reason = '不在白名单中';
              } else if (typeof available === 'function') {
                visibile = available.call(this, value, key);
                if (!visibile) {
                  reason = 'available逻辑计算结果不展示';
                } else {
                  reason = 'available计算结果要展示该字段';
                }
              } else if (!isNone(available)) {
                visibile = !!available;
                reason = `available被设定为${available}`;
              }
              if (debug && process.env.NODE_ENV !== 'production') {
                const view = this.use(key);
                console.debug(
                  '[字段可见性]:',
                  view.label,
                  {
                    mapping,
                    list: propertiesInWhiteList,
                    whiteName,
                    available,
                    visibile,
                    reason,
                    model: this,
                    key,
                    meta,
                  },
                  view
                );
              }
              return visibile;
            },
            readonly(value, key) {
              const { list: propertiesReadonlyList, mapping } =
                this[PropertiesReadonlyListSymbol] || {};
              const whiteAlias = mapping?.[key];
              const readonlyKey = whiteAlias || asset || key;
              let disabled = false;
              let reason = '';
              // 如果返回的edit数据中不存在whiteProperties，代表该数据没有查看和编辑的权限，直接跳过当前权限判断逻辑
              if (propertiesReadonlyList?.includes(readonlyKey)) {
                disabled = true;
                reason = '在只读列表中';
              } else if (typeof readonly === 'function') {
                disabled = readonly.call(this, value, key);
                reason = `逻辑计算可readonly为${disabled}`;
              } else if (!isNone(readonly)) {
                disabled = !!readonly;
                reason = `readonly被设定为${readonly}`;
              }
              if (debug && process.env.NODE_ENV !== 'production') {
                const view = this.use(key);
                console.debug(
                  '[字段只读列表]:',
                  view.label,
                  {
                    mapping,
                    list: propertiesReadonlyList,
                    readonlyKey,
                    readonly: disabled,
                    reason,
                    model: this,
                    key,
                    meta,
                  },
                  view
                );
              }
              return disabled;
            },
          },
        };
        attrs.push(item);
      });
      return attrs;
    },

    /**
     * 计算当前的policy地图
     * @returns
     */
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __takePolicyMapping() {
      const map = mapping || {};

      const schema = this.$schema;
      const fields = Object.keys(schema);
      fields.forEach((key) => {
        if (map[key]) {
          return;
        }
        const meta = schema[key];
        if (meta.asset) {
          map[key] = meta.asset;
        } else {
          map[key] = key;
        }
      });
      return map;
    },

    fromJSON(data) {
      const { _whiteList, whiteProperties, readonlyList, _readonlyList } = data;
      const propertiesInWhiteList = whiteProperties || _whiteList || null;
      const propertiesReadonlyList = readonlyList || _readonlyList || null;
      this[PropertiesInWhiteListSymbol] = {
        list: propertiesInWhiteList,
        mapping: this.__takePolicyMapping(),
      };
      this[PropertiesReadonlyListSymbol] = {
        list: propertiesReadonlyList,
        mapping: this.__takePolicyMapping(),
      };
      return fromJSON.call(this, data);
    },

    fromJSONPatch(data) {
      const { _whiteList, whiteProperties, readonlyList, _readonlyList } = data;
      const propertiesInWhiteList = whiteProperties || _whiteList || null;
      const propertiesReadonlyList = readonlyList || _readonlyList || null;
      this[PropertiesInWhiteListSymbol] = {
        list: propertiesInWhiteList,
        mapping: this.__takePolicyMapping(),
      };
      this[PropertiesReadonlyListSymbol] = {
        list: propertiesReadonlyList,
        mapping: this.__takePolicyMapping(),
      };
      return fromJSONPatch.call(this, data);
    },
  });
  return MaEditorModel;
}
// 对Model原始类进行覆盖，这样才能实现子模型传递
Model.Edit = Edit;

/**
 * 重写Meta方法，实现自动根据meta属性进行校验的逻辑
 * 注意，不支持实例成员的形式，例如
 * class SomeMeta extends Meta {
 *   max = 10
 * }
 * 上面这种不支持，因为max会在执行完实例化之后再赋值到实例上，因此无法走入下面的逻辑
 */
// @ts-ignore
const originUseAttrs = Meta.prototype.__useAttrs;
// @ts-ignore
Meta.prototype.__useAttrs = function (...attrsets) {
  const attrs = attrsets.reduce((attrs, item) => {
    Object.assign(attrs, item);
    return attrs;
  }, {});

  const validators = attrs.validators || [];

  const hasKey = (key) => key in attrs;
  const hasValidator = (name) => validators.some((vad) => vad.name === name);

  if (hasKey('required') && !hasValidator('required')) {
    validators.unshift(Validator.required('{label}必填'));
  }

  if (hasKey('max') && !hasValidator('max')) {
    validators.push(Validator.max('{label}最大不能超过{max}'));
  }

  if (hasKey('min') && !hasValidator('min')) {
    validators.push(Validator.min('{label}最小不能小于{min}'));
  }

  if (hasKey('maxLen') && !hasValidator('maxLen')) {
    validators.push(Validator.maxLen('{label}不能超过{maxLen}个字符'));
  }

  if (hasKey('minLen') && !hasValidator('minLen')) {
    validators.push(Validator.minLen('{label}不能少于{minLen}个字符'));
  }

  if (hasKey('limit')) {
    const { limit } = attrs;
    const [integer, decimal = ''] = limit.split('.');
    if (integer !== '' && !hasValidator('integer')) {
      validators.push(
        Validator.integer(`{label}整数部分不能超过${integer}位`, +integer)
      );
    }
    if (decimal !== '' && !hasValidator('decimal')) {
      validators.push(
        Validator.decimal(`{label}小数部分不能超过${decimal}位`, +decimal)
      );
    }
  }

  const next = {
    ...attrs,
    validators,
  };
  originUseAttrs.call(this, next);
};

class MaBaseModel extends Model {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(data?, ...args) {
    // @ts-ignore
    super(data, ...args);
  }
  static Edit: typeof Edit = Edit;
  static Scene<T>(
    this: ConstructorOf<T>,
    sceneCodes: string | string[]
  ): ConstructorOf<T> & typeof MaBaseModel {
    return OriginalScene.call(this, sceneCodes);
  }
}

export { MaBaseModel as Model };

export function useModel<T extends Model>(
  SomeModel: new (data?: any) => T,
  data?: any
): T {
  const d = useShallowLatest(data);

  const model = useMemo(() => new SomeModel(d), [d, SomeModel]);

  useModelObserve(model);

  return model;
}

export function useModelEffect(model: Model, affect: () => void) {
  useModelWatch(model, '*', affect, true);
}

/**
 * 对模型的变化进行响应
 * @param model
 */
export function useModelObserve(
  model: Model,
  key: string | Meta | string[] | Meta[] = '*',
  deep = true
) {
  const froceUpdate = useForceUpdate();
  useModelWatch(model, key, froceUpdate, deep);
}

export function useModelWatch(
  model: Model,
  key: string | Meta | string[] | Meta[],
  watch: (e: any) => void,
  deep = true
) {
  useEffect(() => {
    if (!model) {
      return;
    }

    if (!key) {
      return;
    }

    const names = [];
    const pushName = (key) => {
      if (typeof key === 'string') {
        names.push(key);
      } else {
        const field = model.use(key, (view) => view.key);
        if (field) {
          names.push(field);
        }
      }
    };
    if (isArray(key)) {
      (key as string[]).forEach(pushName);
    } else {
      pushName(key);
    }

    if (!names.length) {
      return;
    }

    names.forEach((name) => {
      model.watch(name, watch, deep);
      model.watch(name === '*' ? '!' : `!${name}`, watch, deep);
      model.on('recover', watch);
    });

    return () => {
      names.forEach((name) => {
        model.unwatch(name, watch);
        model.unwatch(name === '*' ? '!' : `!${name}`, watch);
        model.off('recover', watch);
      });
    };
  }, [model]);
}
