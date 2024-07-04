import { RangeDatePicker } from '@src/components/date-picker';
import type { SelectDateRangeComponent } from './types';

export const SelectDateRange: SelectDateRangeComponent = function (props) {
  const { readOnly, disabled, ...attrs } = props;
  return <RangeDatePicker {...attrs} disabled={disabled || readOnly} />;
};
