import { DatePicker, DatePickerProps } from 'tdesign-react';
import { ControllerRenderProps } from 'react-hook-form';

interface HookDatePickerProps extends DatePickerProps {
  field: ControllerRenderProps;
}

export const HookDatePicker = (props: HookDatePickerProps) => {
  const { field, onChange, onBlur, ...otherProps } = props;

  function handleChange(value: any, context) {
    field.onChange?.({
      target: { value },
    });
    onChange?.(value, context);
  }

  function handleBlur(context) {
    field.onBlur?.();
    onBlur?.(context);
  }

  const datePickerValue =
    typeof field.value === 'undefined' ? null : field.value;

  return (
    <DatePicker
      value={datePickerValue}
      {...otherProps}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  );
};
