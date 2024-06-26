/* eslint-disable @typescript-eslint/no-unused-vars */
import { Textarea, TextareaProps } from 'tdesign-react';
import { forwardRef } from 'react';
import { UseControllerReturn } from 'react-hook-form';

interface HookTextareaProps extends TextareaProps {
  field: UseControllerReturn['field'];
  fieldState: UseControllerReturn['fieldState'];
  formState: UseControllerReturn['formState'];
}

export const HookTextarea = forwardRef((props: HookTextareaProps, ref: any) => {
  const { fieldState, formState, field, onChange, onBlur, ...otherProps } =
    props;

  function handleChange(value: any, context) {
    field.onChange?.({
      target: { value },
    });
    onChange?.(value, context);
  }

  function handleBlur(value: any, context) {
    field.onBlur?.();
    onBlur?.(value, context);
  }

  // textarea 不支持 value = null，会告警
  const finalValue = field.value === null ? '' : field.value;

  return (
    <Textarea
      ref={(r: any) => {
        if (!r) return;
        ref?.(r);
        field.ref(r?.inputElement);
      }}
      value={finalValue}
      {...otherProps}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  );
});
