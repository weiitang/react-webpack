/*
 * @Author: Jsonz
 * @Date: 2022-09-01 14:56:32
 * @Email: jsonz@qq.com
 * @LastEditors: Jsonz
 * @LastEditTime: 2023-11-08 17:26:44
 *
 * 区间: ['YYYY-MM-DD', 'YYYY-MM-DD'] => ['YYYY-MM-DD 00:00:00', 'YYYY-MM-DD 23:59:59']
 */
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import type { OpUnitType } from 'dayjs';
dayjs.extend(utc);
dayjs.extend(advancedFormat);

// 转为UTC时间
export function toUTC(
  date: string,
  params: {
    isEnd?: boolean;
    unit?: OpUnitType;
    formatStr?: string;
  } = {}
): string {
  const {
    isEnd = false,
    unit = 'd',
    formatStr = 'YYYY-MM-DDTHH:mm:ss[Z]',
  } = params;
  const localDate = isEnd
    ? dayjs(date).endOf(unit).format()
    : dayjs(date).format();
  return dayjs.utc(localDate).format(formatStr);
}

// 转为用户当前时区的UTC时间
export function toLocal(
  date: string,
  params: {
    format?: string;
  } = {}
): string {
  const { format = 'YYYY-MM-DD' } = params;
  if (typeof date !== 'string') return '';
  if (format?.includes('hh:mm')) {
    console.warn(
      '目前为12小时制，如果要改为24小时制请用 HH:mm 代替hh: mm。',
      format
    );
  }
  return dayjs.utc(date).local().format(format);
}

// 当前UTC时间(含时区信息)
export function UTCLocal(): string {
  return dayjs.utc().local().format();
}

// 当前UTC时间(含时区信息)
export function UTCZero(): string {
  return dayjs.utc().format();
}
