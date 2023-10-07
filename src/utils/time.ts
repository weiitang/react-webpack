import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import type { OpUnitType } from 'dayjs';

dayjs.extend(utc);

// 转为UTC时间
export function toUTC(
  date: string,
  params: {
    isEnd?: boolean;
    unit?: OpUnitType;
    formatStr?: string;
  } = {},
): string {
  const { isEnd = false, unit = 'd', formatStr = 'YYYY-MM-DDTHH:mm:ss[Z]' } = params;
  const localDate = isEnd ? dayjs(date).endOf(unit).format() : dayjs(date).format();
  return dayjs.utc(localDate).format(formatStr);
}

// 转为用户当前时区的UTC时间
export function toLocal(
  date: string,
  params: {
    format?: string;
  } = {},
): string {
  const { format = 'YYYY-MM-DD' } = params;
  if (typeof date !== 'string') return '';
  if (format?.includes('hh:mm')) console.warn('默认采用24小时制展示格式', format);
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

/**
 * 判断是否为UTC格式的时间
 * @param value
 */
export function isUtcFormat(value) {
  return value && /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z/.test(value);
}

