/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-types */
import { Component, Model } from '@core';
import { decideby } from 'ts-fns';
import { useShallowLatest } from '@src/hook';
import type { ReactNode } from 'react';
import { useState, useContext, useMemo } from 'react';
import { Field } from './field';
import type { IFormItemProps, IView } from './types';
import { FormContext, FormItemContext } from './context';

export class FormItemCommon<P = any> extends Component<IFormItemProps & P> {
  Implemention = this.Implement.bind(this);

  shouldUpdate(props) {
    const { render, ...attrs } = props;
    return [attrs];
  }

  Render(props: IFormItemProps) {
    const context = useContext(FormContext);
    const {
      model = context.model,
      validateManually = context.validateManually,
      name,
      names,
      meta,
      metas,
      render,
      requiredMark,
      labelAlign = context.labelAlign || 'top',
      component: C,
      props: passedProps = {},
      map,
      error,
      children: innerContent,
      ...attrs
    } = props;

    const [validateStatus, setValidateStatus] = useState(false);
    const { Implemention } = this;

    /**
     * <C {...inside} {...props}>
     * 这行代码逼的
     */
    let defaultProps = {
      ...passedProps,
    };
    if (context?.disabled !== undefined) {
      defaultProps = {
        disabled: context?.disabled,
        ...passedProps,
      };
    }

    const componentProps = useShallowLatest(defaultProps);

    if (!name && !meta && !render && !C) {
      return <Implemention>{innerContent}</Implemention>;
    }

    return (
      <Field
        model={model}
        name={name}
        names={names}
        meta={meta}
        metas={metas}
        effects={[model, error, validateStatus, componentProps]}
        render={(inside, view, deps, context) => {
          const { required, hidden } = inside;
          const {
            label,
            changed,
            action,
            help,
            tips,
            debug,
            validatorSuccussMessage,
          } = view;

          if (debug && process.env.NODE_ENV !== 'production') {
            console.debug('[FormItem]:', label, {
              inside,
              view,
              deps,
              context,
              meta,
              name,
              model,
            });
          }

          if (hidden) {
            return null;
          }

          const localContext = {
            ...context,
            setValidateStatus,
          };

          // @ts-ignore
          const mapToProps = C?.mapToProps;

          const appended = map?.(view) || {};
          const mapped = mapToProps?.(view) || {};
          const composed = { ...inside, ...mapped, ...appended };

          const isNeedCheck = validateManually ? validateStatus : true;
          const isShowError =
            (changed && isNeedCheck) || context.validateStatus;
          // 当 validateStatus 为true时，就完全不管每一个字段的实际情况，全部都去进行检查和错误提示
          const errorMessage = isShowError
            ? error || view.errors[0]?.message || ''
            : '';
          const passedContext = {
            model,
            view,
            deps,
          };

          const realRequired =
            typeof requiredMark === 'undefined' ? required : requiredMark;

          const passedAttrs = {
            errorMessage,
            validatorSuccussMessage,
            required: realRequired,
            action,
            help,
            tips,
            labelAlign,
            label,
            ...composed,
            ...attrs,
          };

          const children = decideby(() =>
            this.generateChildren(
              { component: C, render, children: innerContent },
              {
                inside: composed,
                props: componentProps,
                extra: attrs,
                attrs: passedAttrs,
              },
              { view, deps, context: localContext }
            )
          );
          return (
            <FormItemProvider
              value={{
                view,
                deps,
                context: localContext,
                model,
                setValidateStatus,
                meta,
                name,
              }}
            >
              <Implemention {...passedAttrs} context={passedContext}>
                {children}
              </Implemention>
            </FormItemProvider>
          );
        }}
      />
    );
  }

  onCatch(error) {
    const { meta, name = meta, model } = this.props;
    // @ts-ignore
    // eslint-disable-next-line no-console
    console.error('FormItem渲染', name, '时发生错误', model.use(name), error);
  }

  generateChildren(
    { component: C, render, children },
    { inside, props, extra: _extra, attrs: _attrs },
    { view, deps, context }
  ) {
    if (C) {
      return (
        <C {...inside} {...props}>
          {children}
        </C>
      );
    }
    if (render) {
      return render(inside, view, deps, context);
    }
    return children;
  }

  // 实现的组件
  Implement<P extends IFormItemProps>(
    props: P & {
      errorMessage?: string;
      required?: boolean;
      action?: ReactNode | string;
      labelAlign?: 'left' | 'right' | 'top';
      label?: string;
      children?: any;
      context?: {
        view: IView;
        model: Model;
      };
      [key: string]: any;
    }
  ): ReactNode;
  Implement(): never {
    throw new Error(`FormItem.Implement 必须被实现`);
  }
}

function FormItemProvider({ value, children }) {
  const { Provider } = FormItemContext;
  const {
    view,
    deps: d,
    context: c,
    model,
    setValidateStatus,
    meta,
    name,
  } = value;
  const deps = useShallowLatest(d);
  const context = useShallowLatest(c);
  const ctx = useMemo(
    () => ({ view, deps, context, model, setValidateStatus, meta, name }),
    [view, deps, context, model, setValidateStatus, meta, name]
  );
  return <Provider value={ctx}>{children}</Provider>;
}

export function useFormItemContext(): {
  view: any;
  deps: any;
  /**
   * FormProvider给的context
   */
  context: any;
  model: any;
  /**
   * 函数，可以快速设定当前item内的validateStatus
   */
  setValidateStatus: Function;
  meta: any;
  name: string;
} {
  return useContext(FormItemContext);
}
