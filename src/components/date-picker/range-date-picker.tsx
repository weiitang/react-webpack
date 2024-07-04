/* eslint-disable @typescript-eslint/no-empty-function */
import * as React from 'react';
import { Popup, Input } from 'tdesign-react';

import classnames from 'classnames';
import { omit } from 'lodash';
import dayjs from 'dayjs';
import { useToggle, useClickAway } from '@src/hook';
import { DatePickerPopup } from './range-popup';
import './index.less';
import type {
  DateValue,
  RangeDatePickerType,
  RangeDatePickerProps,
} from './types';

const language = 'en';
const isEn = language === 'en';
const defaultFormat = isEn ? 'MMM/DD/YYYY' : 'YYYY-MM-DD';
const today = dayjs().format('YYYY-MM-DD');
const defaultProps: Partial<RangeDatePickerType> = {
  mode: 'date',
  presets: {
    '6个月': [dayjs().subtract(6, 'month').format('YYYY-MM-DD'), today],
    '3个月': [dayjs().subtract(3, 'month').format('YYYY-MM-DD'), today],
    本月: [dayjs().startOf('month').format('YYYY-MM-DD'), today],
  },
  /**
   * @default zh: YYYY-MM-DD en:MMM-DD-YYYY
   */
  format: defaultFormat,
  /**
   * 分隔符
   * @DEFAULT zh: ~ en: To ?
   */
  separator: isEn ? 'To' : '~',
  value: ['', ''],
};

export function RangeDatePicker(originProps: RangeDatePickerProps) {
  const props: RangeDatePickerType = {
    ...defaultProps,
    ...originProps,
  };
  const {
    clearable,
    inputClassName,
    presets,
    onChange,
    className,
    value,
    defaultValue,
    separator,
    size,
    onPick,
    placeholder,
  } = props;
  const popupProps = omit(props, 'range');

  const [dates, setDates] = React.useState(value ?? defaultValue);
  React.useEffect(() => {
    setDates(value);
  }, [value]);
  const [popupVisible, { toggle }] = useToggle(false);
  const [hover, setHover] = React.useState(false);
  const wrapRef = React.useRef<any>();
  const popupRef = React.useRef<any>({
    getPopupElement: () => {},
  });
  const dateRef1 = React.useRef<any>({
    getPopupElement: () => {},
  });
  const dateRef2 = React.useRef<any>({
    getPopupElement: () => {},
  });

  useClickAway<PointerEvent>((e) => {
    if (!popupVisible) return;
    const path = e.composedPath();
    const date1El = dateRef1.current?.getPopupElement?.();
    const date2El = dateRef2.current?.getPopupElement?.();
    const popup = popupRef.current?.getPopupElement?.();
    const elList = [date1El, date2El, popup, wrapRef.current];
    if (path.some((node) => elList.includes(node))) return;
    toggle();
  }, []);

  const handleDateChange = React.useCallback(
    (target: 'start' | 'end' | 'range', nextValue: DateValue) => {
      let nextDates = [...dates] as DateValue;
      if (Array.isArray(nextValue)) {
        nextDates = nextValue;
      } else {
        const i = target === 'start' ? 0 : 1;
        nextDates[i] = nextValue;
      }

      if (nextDates[0] === dates[0] && nextDates[1] === dates[1]) return;
      const full = nextDates[0] && nextDates[1];
      // 全有值才会触发 onChange
      full && onChange?.(nextDates);
      setDates(nextDates);
    },
    [dates]
  );

  const handleClear = React.useMemo(() => {
    if (!clearable) return () => {};
    return () => {
      setDates(defaultProps.value);
      onChange?.(defaultProps.value);
    };
  }, [clearable, onChange]);

  const datePickerPopup = React.useMemo(
    () => (
      <DatePickerPopup
        {...popupProps}
        value={dates}
        presets={presets}
        onChange={handleDateChange}
        onPick={onPick}
        startDatePickerRef={dateRef1}
        endDatePickerRef={dateRef2}
      />
    ),
    [presets, value, handleDateChange]
  );

  const dateInputText = React.useMemo(() => {
    if (!dates?.[0] || !dates?.[1]) return '';
    return `${dates[0]} ${separator} ${dates[1]}`;
  }, [dates]);

  const suffixIcon =
    hover && value?.length && clearable ? (
      <span
        className="clearIcon"
        onClick={(e) => {
          e.stopPropagation();
          handleClear();
        }}
      >
        x
      </span>
    ) : (
      <span>⭕️</span>
    );

  return (
    <div className={classnames('date-picker', className)} ref={wrapRef}>
      <Popup
        content={datePickerPopup}
        placement="bottom"
        visible={popupVisible}
        ref={popupRef}
        destroyOnClose
      >
        <Input
          onMouseleave={() => setHover(false)}
          onMouseenter={() => setHover(true)}
          placeholder={placeholder || '请选择日期'}
          suffixIcon={suffixIcon}
          onClick={() => {
            toggle();
          }}
          value={dateInputText}
          className={inputClassName}
          size={size}
        />
      </Popup>
    </div>
  );
}
