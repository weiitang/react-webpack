import type { DatePickerProps } from 'tdesign-react';
import { DatePicker as TDatePicker } from 'tdesign-react';

/**
 * datePicker 组件
 * 处理props，分发给不同的Component处理
 */
const defaultProps: Partial<DatePickerProps> = {
  mode: 'date',
};
export function DatePicker(
  originProps: DatePickerProps & { readOnly?: boolean }
) {
  const { disabled, readOnly } = originProps;

  const props = {
    ...defaultProps,
    ...originProps,
    disabled: readOnly || disabled,
  };

  if (props.value === null) {
    props.value = '';
  }

  return <TDatePicker {...props} />;
}
