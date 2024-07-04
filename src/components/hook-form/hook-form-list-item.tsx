import { Controller, useFormContext } from 'react-hook-form';
import { useEffect, useRef, useState } from 'react';
import get from 'lodash/get';
import { useIsMount } from '@src/hook';
import { useFormItem } from './hooks/useFormItem';
import { useHookFormContext } from './context';
import { HookFormItemLayout } from './hook-form-item-layout';
import { FormItemProps } from './hook-form-item';

export interface FormListItemProps extends FormItemProps {
  index: number;
}

export function HookFormListItem(props: FormListItemProps) {
  const { name, index, render } = props;

  const useFormItemResult = useFormItem(props);
  const { labelAlign, tips, status, icon, rules, requiredMark, renderProps } =
    useFormItemResult;

  const { control } = useFormContext();
  const formModel = useHookFormContext();
  const model = useRef(get(formModel.model, name, {}));
  const label = useFormItemResult.label ?? model.current?.renderProps?.label;
  const isMount = useIsMount();

  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    if (!rules?.validate) return;
    const keys = Object.keys(rules?.validate);
    keys.forEach((val) => {
      const fnc = rules.validate[val];
      rules.validate[val] = function (value, formValues) {
        return fnc(value, formValues, index);
      };
    });
  }, [index, rules]);

  useEffect(() => {
    if (!Reflect.has(model.current, 'shouldRender')) return;

    const subscription = formModel.watch((values) => {
      const result = model.current.shouldRender(values, { index, formModel });
      Promise.resolve(result).then((result) => {
        // fix: Can't perform a React state update on an unmounted component
        if (!isMount.current) return;
        setShouldRender(result);
      });
    });

    return () => subscription.unsubscribe();
  }, [index]);

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
          render({ status, ...controlProps, ...renderProps })
        }
      />
    </HookFormItemLayout>
  );
}
