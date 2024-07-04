import * as React from 'react';
import {
  DatePicker as TDatePicker,
  DatePickerProps,
  Radio,
} from 'tdesign-react';
import classnames from 'classnames';
import { isEqual } from 'lodash';
import type { DateValue, RangeDatePickerType } from './types';

export type DatePickerPopupType = Omit<
  DatePickerProps,
  'onChange' | 'onPick' | 'presets' | 'value' | 'defaultValue'
> & {
  value: DateValue;
  defaultValue?: DateValue;
  onChange?: (
    target: 'start' | 'end' | 'range',
    date: string | DateValue
  ) => void;
  popupClassName?: string;
  onPick?: RangeDatePickerType['onPick'];
  presets?: RangeDatePickerType['presets'];

  startDatePickerRef?: React.Ref<HTMLDivElement>;
  endDatePickerRef?: React.Ref<HTMLDivElement>;
};

export const DatePickerPopup = (props: DatePickerPopupType) => {
  const {
    value,
    defaultValue = [],
    onChange,
    format,
    presets,
    popupClassName,
    onPick,
    startDatePickerRef,
    endDatePickerRef,
    ...rest
  } = props;

  const [presetValue, setPresetValue] = React.useState<string>();
  const presetKeys = Object.keys(presets);

  React.useEffect(() => {
    const presetSelected = Object.entries(presets).find(([, presetValue]) =>
      isEqual(presetValue, value)
    );
    setPresetValue(presetSelected?.[0] ?? '');
  }, [value, presets]);

  const handleChange = (target: 'start' | 'end') => (date: string) => {
    onChange?.(target, date);
    onPick?.(target, date);
  };

  return (
    <div className={classnames('date-picker-popup', popupClassName)}>
      <div className="item">
        <label>开始日期</label>
        <TDatePicker
          {...rest}
          popupProps={{
            // @ts-ignore: tDesign类型不规范
            ref: startDatePickerRef,
          }}
          ref={startDatePickerRef}
          defaultValue={defaultValue?.[0]}
          value={value[0]}
          onChange={handleChange('start')}
          format={format}
        />
      </div>
      <div className="item">
        <label>结束日期</label>
        <TDatePicker
          {...rest}
          popupProps={{
            // @ts-ignore
            ref: endDatePickerRef,
          }}
          defaultValue={defaultValue?.[0]}
          value={value[1]}
          onChange={handleChange('end')}
          format={format}
        />
      </div>
      {!!presetKeys.length && (
        <div className="item">
          <label>快速选择</label>
          <Radio.Group
            value={presetValue}
            onChange={(key: string) => {
              onChange?.('range', presets[key]);
              setPresetValue(key);
            }}
          >
            {presetKeys.map((item) => (
              <Radio.Button key={item} value={item}>
                {item}
              </Radio.Button>
            ))}
          </Radio.Group>
        </div>
      )}
    </div>
  );
};
