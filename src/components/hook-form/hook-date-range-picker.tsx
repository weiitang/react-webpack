import { DateRangePicker, DateRangePickerProps } from 'tdesign-react';
import { ControllerRenderProps } from 'react-hook-form';

interface HookDateRangePickerProps extends DateRangePickerProps {
  field: ControllerRenderProps;
}

export const HookDateRangePicker = (props: HookDateRangePickerProps) => {
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

  return (
    <DateRangePicker
      {...otherProps}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  );
};
