import type { DatePickerProps, DateValue as TdDateValue } from 'tdesign-react';
import type { SizeEnum } from 'tdesign-react/es/common';

export type DateValue = TdDateValue[];

// 内部props 部分接口不对外放开
export interface RangeDatePickerType
  extends Omit<
    DatePickerProps,
    'onPick' | 'value' | 'defaultValue' | 'onChange' | 'presets'
  > {
  /**
   * 值变化回调函数，只有在两个日期都选了才会触发
   */
  onChange?: (value: DateValue) => void;
  /**
   * 选中开始或结束日期时触发
   * @param target 'start' | 'end'
   * @param date 'YYYY-MM-DD'
   */
  onPick?: (target: 'start' | 'end', date: string) => void;
  /**
   * 日期值 ['YYYY-MM-DD', 'YYYY-MM-DD'] - 受控状态
   */
  value?: DateValue;
  /**
   * 初始值 ['YYYY-MM-DD', 'YYYY-MM-DD'] - 非受控状态
   */
  defaultValue?: DateValue;

  /**
   * 范围选择input的className
   */
  inputClassName?: string;
  /**
   * 范围选择popup的className
   */
  popupClassName?: string;
  /**
   * 日期分隔符
   * @default ~
   */
  separator?: string;
  className?: string;

  presets?: {
    [key: string]: DateValue;
  };

  size?: SizeEnum;
}

// 对外props
export type RangeDatePickerProps = Omit<
  RangeDatePickerType,
  'inputClassName' | 'popupClassName' | 'separator'
>;
