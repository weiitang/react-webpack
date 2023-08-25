/* eslint-disable no-unused-expressions */
/* eslint-disable no-return-assign */
import { isEmpty, isDate, isObject } from 'lodash';
import Config from '../http/config';
import { getGhostUser } from '../http/debug';
import qs from 'qs';
// import i18next from 'i18next';

export const CURRENCY_SYMBOL_MAP = {
  'USD': '$',
  'CNY': '¥',
  'HKD': '$',
  // 下面的暂不开放
  // 'KRW': '₩', // 韩元
  // 'JPY': '¥', // 日元
  // 'RUB': '₽', // 卢布
  // 'EUR': '€', // 欧元
  // 'GBP': '£', // 英镑
  // 'SEK': 'kr', // 瑞典克朗
  // 'CAD': '$', // 加拿大元
  // 'INR': '₹', // 卢比
};

/**
 * 是否调试模式
 * @return {Boolean}
 */
export function isDebug() {
  return ['development', 'test'].indexOf(process.env.NODE_ENV as string) !== -1;
}

export function isLocalDev() {
  return process.env.NODE_ENV === 'development';
}

/**
 * 是否站点域名地址
 * @return {Boolean}
 */
export function isProjectUrl(url) {
  if (!url) {
    return false;
  }

  // 相对路径都认为是true
  if (!isHttpURL(url)) {
    return true;
  }

  return url.indexOf(location.origin) === 0;
}

/**
 * 是否http(s) url
 * @param {*} url
 * @return {Boolean}
 */
export function isHttpURL(url) {
  return /^https?:\/\//i.test(url);
}

/**
 * 转换为站点完整的url
 * @param {String} url
 * @param {Boolean} [baseAppStatic:false] 是否基于App静态资源路径, 只对App平台有效
 * eg:
 *  1) tpptest.oa.com/app/xxx
 *  2) oa.m.tencent.com/an:tpptest/app/xxx
 * @return {String}
 */
export function toBaseURL(url, baseAppStatic = false) {
  if (!url) {
    return url;
  }

  // 开发测试环境，附加ghostlogin参数，兼容客户端本地调试时访问文件等的鉴权
  if (isDebug() && isProjectUrl(url)) {
    const user = getGhostUser();
    const _url = url.split('?');
    let parsed: any = null;

    if (_url[1]) {
      parsed = qs.parse(_url[1], { ignoreQueryPrefix: true });
      if (!parsed.ghostlogin) {
        parsed.ghostlogin = user;
      }
    } else {
      parsed = {
        ghostlogin: user
      };
    }


    url = _url[0] + '?' + qs.stringify(parsed);
  }


  if (isHttpURL(url)) {
    return url;
  }

  // 对于App, url可能是本地的静态资源，此时已经带上根路径
  // 对于移动网关的情况，会带上'/an:tpptest'的路径，此时再附加baseURL会有问题
  // eg: url = /an:tpptest/app/assets/images/xxx.png
  // 需要转为/app/assets/images/xxx.png
  if (process.env.PLATFORM === 'app') {
    // const rootpath = window.__public_root_path;
    const rootpath = '/';
    if (url.indexOf(rootpath) !== -1) {
      url = url.replace(rootpath, '');
    }
  }

  let baseURL = Config.baseURL;

  // App下，非开发模式下需要附加根目录
  // https://tpptest.oa.com/app
  // https://oa.m.tencent.com/an:tpptest/app
  if (process.env.PLATFORM === 'app' && baseAppStatic) {
    const path = baseURL + '/app';
    // 检查当前路径是否包含/app目录来判断
    if (location.href.toLowerCase().indexOf(path.toLowerCase()) === 0) {
      baseURL += '/app';
    }
  }

  return baseURL + (url.substr(0, 1) === '/' ? url : '/' + url);
}

/**
 * 判断是否为File实例
 * @param {*} file
 */
function isFile(file) {
  return file instanceof File;
  // return isBlob(value) &&
  //  (typeof value.lastModifiedDate === 'object' || typeof value.lastModified === 'number') &&
  //  typeof value.name === 'string'
}

/**
 * 将一个对象的属性层级打平，多级变为一级，主要用于表单提交使用
 * @param {*} obj
 * @param {function} determine 用于决定一个对象是否要更深一步去打平，返回true表示要更深一层，返回false则直接将该对象作为键值
 */
export function flatObject(obj, determine?) {
  const flat = (input, path = '', result = {}) => {
    if (Array.isArray(input)) {
      input.forEach((item, i) => flat(item, `${path}[${i}]`, result));
      return result;
    }
    else if (input && typeof input === 'object' && !isFile(input) && !isDate(input)) {
      if (typeof determine === 'function' && !determine(input)) {
        result[path] = input;
        return result;
      }

      const keys = Object.keys(input);
      keys.forEach((key) => {
        const value = input[key];
        flat(value, !path ? key : `${path}[${key}]`, result);
      });
      return result;
    }
    else {
      result[path] = input;
      return result;
    }
  };
  if (!obj || typeof obj !== 'object') {
    return {};
  }
  return flat(obj);
}

export const path2Params = str => {
  if (isObject(str)) return str;
  if (str.indexOf('?') === 0) {
    str = str.slice(1);
  }
  const obj = {};
  str.split('&').forEach(item => {
    const [key, val] = item.split('=');
    !isEmpty(key) && (obj[key] = decodeURIComponent(val));
  });
  return obj;
};

export const params2Path = obj => Object.entries(obj).reduce((acc, [key, val], index, arr) => acc += `${key}=${val}${index !== arr.length - 1 ? '&' : ''}`, '?');

export const generateSearchParams = (location, newParams) => {
  return {
    ...location,
    search: params2Path({
      ...path2Params(location.search),
      ...newParams,
    })
  };
};

/**
 * options
 *  {
 *    replace
 *  }
 */
export const generateHistoryPurePush = history => (newParams, { replace }) => {
  const newSearch = params2Path({
    ...path2Params(replace ? {} : location.search),
    ...path2Params(newParams)
  });
  if (history.location.search === newSearch) return;
  history.push({
    ...history.location,
    search: newSearch
  });
};


/**
 * 获取货币符号
 * @param {String} currency
 * @return {String} 没有转义返回空
 */
export function getCurrencySymbol(currency) {
  currency = (currency || '').toUpperCase();
  return CURRENCY_SYMBOL_MAP[currency] || '';
}


/**
 * 过滤行业
 */
export function professionsFilter(professions) {
  const filterProfessionNameList = ['O2O', 'Fintech', 'Healthcare', 'Education', 'Electric Vehicle', 'Entertainment', 'E-commerce', 'Logistics', 'Enterprise Services',];
  const filterProfessionIdList = [
    '04E47310D401B8E32346B9FBB7F0EB8D',
    '1203C629EDC140AA6DEF67121D5BA05E',
    '26B826FFFDEAD1192BB2D247734BECED',
    '63075DD28C823E59E8D9FBD29BB45453',
    '7B07FDA2F3ADD6B213C9B52B774603E7',
    'A4F846C95BB1DF8357ECE0A8284A6632',
    'AA9667B74BC59BF45D1BF4A431B0FA8F',
    'F133E4F83C47E39CDD328E647A81FD88',
    'FA66FF13F749DA38B6095730557794E1',
  ];

  return professions.filter(item => {
    return filterProfessionNameList.includes(item.profession_name_en) || filterProfessionIdList.includes(item.profession_id);
  });
}

/**
 * 依据指定的键值对对象数组去重
 *
 * @param {Array}  list 对象列表
 * @param {String} key  键名
 */
export function uniqueObjListByKey(list, key) {
  const hash = {};
  const newList = list.reduce((item, next) => {
    hash[next[key]] ? '' : hash[next[key]] = true && item.push(next);
    return item;
  }, []);
  return newList;
}

/**
 * 将props的页数转为接口需要参数
 * @param {*} pagination
 */
export const translatePagination2Params = pagination => {
  const { currentPage, pageSize } = pagination;
  return {
    page: currentPage,
    per_page: pageSize,
  };
};

/**
 * 将url中的search部分解析为对象
 * @param {*} search
 */
export function parseSearchQuery(search) {
  const [...matches] = search.matchAll(/([a-zA-Z].*?)=([a-zA-Z0-9]*)/g);
  const data = {};

  const tryGet = (v) => {
    try {
      return JSON.parse(v);
    }
    catch (e) {
      return v;
    }
  };

  matches.forEach((item) => {
    /* eslint-disable no-unused-vars */
    const [_, key, value] = item;
    data[key] = tryGet(value);
  });
  return data;
}

// export function getRoundMapping(round) {
//   if (!round) return ''; // 'N/A' || '--'
//   if (i18next.language === 'en') return round;
//   return i18next.t(`shared-common:${round}`).replace(/Round/g, '轮');
// }

// export function DatePickFormat() {
//   return {
//     format: i18next.language === 'zh-CN' ? 'YYYY-MM-DD' : 'DD-MMM-YYYY'
//   };
// }
