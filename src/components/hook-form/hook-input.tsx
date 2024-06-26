/* eslint-disable @typescript-eslint/no-unused-vars */
import { Input } from '@src/components/forms/input';
import { forwardRef } from 'react';
import type { InputComponentProp } from '@src/components/forms/types';
import { UseControllerReturn } from 'react-hook-form';

type HookInputProps = InputComponentProp & {
  field: UseControllerReturn['field'];
  fieldState: UseControllerReturn['fieldState'];
  formState: UseControllerReturn['formState'];
};

export const HookInput = forwardRef((props: HookInputProps, ref: any) => {
  // ...others,需要消耗掉子组件虚假的props
  const { fieldState, formState, field, onChange, onBlur, ...otherProps } =
    props;

  function handleChange(value: any) {
    field.onChange?.({
      target: { value },
    });
    onChange?.(value);
  }

  function handleBlur(value: any, context) {
    field.onBlur?.();
    onBlur?.(value, context);
  }

  return (
    <Input
      ref={(r: any) => {
        if (!r) return;
        ref?.(r);
        field.ref(r?.inputElement);
      }}
      {...otherProps}
      value={field.value}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  );
});
