import { useForceUpdate } from '@src/hook';
import { Component, Model } from '@core';
import { useEffect, useMemo, useContext } from 'react';
import { isInstanceOf } from 'ts-fns';
import { useShallowLatest } from '@src/hook';
import { FormContext } from './context';
import type { IFieldProps, IView } from './types';

export class Field extends Component<IFieldProps> {
  Render(props) {
    const context = useContext(FormContext);
    const forceUpdate = useForceUpdate();

    const { model = context.model, meta, metas, render } = props;
    let { name, names } = props;

    if (!name && meta) {
      name = model.use(meta, (view) => view.key);
    }

    if (!names && metas) {
      names = metas.map((meta) => model?.use(meta)?.key || '').filter(Boolean);
    }

    if (!names) {
      names = [];
    }

    const nameList = useShallowLatest([name, ...names]);
    const views = model?.$views;
    const view: IView = views?.[name] as unknown as IView;

    useEffect(() => {
      if (!model) {
        return;
      }

      if (!name) {
        return;
      }

      if (!nameList.length) {
        return;
      }

      nameList.forEach((name) => {
        model.watch(name, forceUpdate, true);
        model.watch(`!${name}`, forceUpdate, true);
        model.on('recover', forceUpdate);
      });
      return () =>
        nameList.forEach((name) => {
          model.unwatch(name, forceUpdate);
          model.unwatch(`!${name}`, forceUpdate);
          model.off('recover', forceUpdate);
        });
    }, [model, nameList]);

    const deps = useMemo(() => {
      const obj = {};

      if (!model) {
        return obj;
      }

      if (!name) {
        return obj;
      }

      if (!nameList.length) {
        return obj;
      }

      if (!views) {
        return obj;
      }

      if (!view) {
        return obj;
      }

      nameList.forEach((name) => {
        const view = views[name];
        if (view) {
          obj[name] = view;
        }
      });
      return obj;
    }, [model, nameList]);

    if (!isInstanceOf(model, Model)) {
      return null;
    }

    // dont show if no model
    if (!model || !name) {
      return null;
    }

    // dont show not existing field
    if (!view) {
      return null;
    }

    const {
      value,
      readonly,
      disabled,
      hidden,
      required,
      placeholder,
      maxLen,
      minLen,
      max,
      min,
    } = view;

    const attrs = {
      name,
      value,
      readOnly: readonly,
      disabled,
      hidden,
      required,
      placeholder,
      ...{
        maxLength: maxLen,
        minLength: minLen,
        max,
        min,
      },
      onChange: (e: any) => {
        if (e?.target && 'value' in e.target) {
          view.value = e.target.value;
        } else {
          view.value = e;
        }
      },
    };

    return render ? render(attrs, view, deps, context) : null;
  }

  shouldUpdate(props) {
    const { effects = [] } = props;
    return effects;
  }
}
