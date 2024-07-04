import { DatePicker } from '@src/components/date-picker';
import type { SelectDateComponent } from './types';

export const SelectDate: SelectDateComponent = function (props) {
  const { readOnly, disabled, ...attrs } = props;
  return <DatePicker {...attrs} disabled={disabled || readOnly} />;
};
