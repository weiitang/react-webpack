import { Controller, useFormContext, ControllerProps } from 'react-hook-form';
import { useEffect, useRef, useState } from 'react';
import get from 'lodash/get';
import { useFormItem } from './hooks/useFormItem';
import { useHookFormContext } from './context';
import {
  HookFormItemLayout,
  FormItemLayoutProps,
} from './hook-form-item-layout';

export interface FormItemProps
  extends FormItemLayoutProps,
    Omit<ControllerProps, 'render'> {
  render?: (props: any) => React.ReactElement;
}

export function HookFormItem(props: FormItemProps) {
  const { name, render } = props;

  const { labelAlign, tips, status, icon, rules, requiredMark, renderProps } =
    useFormItem(props);

  const { control } = useFormContext();
  const formModel = useHookFormContext();
  const model = useRef(get(formModel.model, name, {}));

  const label = props?.label ?? model.current?.renderProps?.label;

  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    if (!Reflect.has(model.current, 'shouldRender')) return;

    function execShouldRender(values?: any) {
      // eslint-disable-next-line no-param-reassign
      if (!values) values = formModel.getValues();
      const result = model.current.shouldRender(values, { formModel });
      Promise.resolve(result).then((result) => {
        setShouldRender(result);
      });
    }

    const subscription = formModel.watch(execShouldRender);

    execShouldRender();
    return () => subscription.unsubscribe();
  }, []);

  if (!shouldRender) return null;

  return (
    <HookFormItemLayout
      requiredMark={requiredMark}
      status={status}
      icon={icon}
      tips={tips as any}
      labelAlign={labelAlign}
      label={label}
    >
      <Controller
        name={name}
        rules={rules}
        control={control}
        render={(controlProps) =>
          render({ status, name, ...controlProps, ...renderProps })
        }
      />
    </HookFormItemLayout>
  );
}
