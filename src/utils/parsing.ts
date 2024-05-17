// ['number,month'] eg: ['-3,month'今天往前3个月, '3,month'今天往后三个月, 'start,month'1号到今天, 'end,month'今天到月底] month,day,year
import dayjs from 'dayjs';
export type IOptions = {
  id: string;
  name: string;
};

export function parseDate(sign: string): [dayjs.Dayjs, dayjs.Dayjs] {
  const [operation, unit] = sign.split(',') as [string, dayjs.OpUnitType];
  const today = dayjs();
  let anotherDay;
  if (Number.isNaN(Number(operation))) {
    switch (operation) {
      case 'start':
        anotherDay = dayjs().startOf(unit as any);
        break;
      case 'end':
        anotherDay = dayjs().endOf(unit as any);
        break;
      default:
        console.warn(`未实现的约定: ${sign}`);
    }
  } else {
    anotherDay = dayjs().add(Number(operation), unit as any);
  }

  const todayIsBefore = today.isBefore(anotherDay);
  return todayIsBefore ? [today, anotherDay] : [anotherDay, today];
}

/**
 * 把数据解析成IOptions
 * @param originData [{ key: a, name: b, nameEn: c}]
 * @param keys 'id:key,name:{nameEn}({name})' => c(b)
 * @returns
 */
export function parseOptions(originData: any[], keys: string) {
  if (!keys) return originData;
  const idKey = keys.match(/^id:(\w*)/)[1];
  const nameTemplate = keys.match(/,name:(.*)$/)[1];
  return originData.map((item) => {
    const id = item[idKey];
    let name = nameTemplate;
    // /(?<={)(\w*)(?<!})/g
    nameTemplate.match(/\{(\w*)\}/g).forEach((key) => {
      const tempKey = key.replace('{', '').replace('}', '');
      name = name.replaceAll(`{${tempKey}}`, item[tempKey]);
    });
    return {
      id,
      name,
      parentId: null,
      weight: null,
    };
  });
}

/**
 * 解析money
 * { value: '1,000.00', codes: 'dep1,dep2', formatPattern: '{1} {0}{2}', data: { dep1: 'cny', dep2: '。' }} => cny 1,000.00。
 */
export function parseMoney(props: {
  value: string;
  codes: string;
  formatPattern: string;
  data: any;
}) {
  const { value, codes, formatPattern, data } = props;
  const depsCode = codes.split(',');
  const deps = depsCode.map((key) => data[key]);
  const fillList = [value, ...deps];
  return formatPattern.replace(/\{(\d+)\}/g, (v) => {
    const index = Number(v.replace(/\{|\}/g, ''));
    return fillList[index] || '';
  });
}

/**
 * 解析字节大小
 */
export function formatBytes(bytes, decimal = 3) {
  const marker = 1024;
  const kb = marker;
  const mb = marker * marker;
  const gb = marker * marker * marker;

  if (bytes < kb) return `${bytes} B`;
  if (bytes < mb) return `${(bytes / kb).toFixed(decimal)} KB`;
  if (bytes < gb) return `${(bytes / mb).toFixed(decimal)} MB`;
  return `${(bytes / gb).toFixed(decimal)} GB`;
}
