/* eslint-disable @typescript-eslint/no-unused-vars */
import { isObject } from 'lodash';

export function parseUrl(url: string): {
  path: string;
  pathname: string;
  search: string;
  hash: string;
} {
  const [path, hash = ''] = url.split('#');
  const [pathname, search = ''] = path.split('?');
  return { path, pathname, search, hash };
}

export function parseSearch(search: string): {
  [key: string]: string;
} {
  const params = {};
  const segs = search.replace(/^\?/, '').split('&');
  for (let i = 0, len = segs.length; i < len; i++) {
    if (segs[i]) {
      const p = segs[i].split('=');
      // eslint-disable-next-line prefer-destructuring
      params[p[0]] = p[1];
    }
  }
  return params;
}

/**
 * resolve the url
 * @param {string} dir relative to this dir path
 * @param {string} to given target path
 * @returns url path begin with /
 */
export function resolveUrl(dir: string, to: string): string {
  const roots = (dir || '').split('/').filter((item) => item);
  const blocks = (to || '').split('/').filter((item) => item);
  while (true) {
    const block = blocks[0];
    if (block === '..') {
      blocks.shift();
      roots.pop();
    } else if (block === '.') {
      blocks.shift();
    } else {
      break;
    }
  }

  const url =
    `${roots.length ? '/' : ''}${roots.join('/')}${
      blocks.length ? '/' : ''
    }${blocks.join('/')}` || '/';
  return url;
}

export function revokeUrl(abs: string, url: string): string {
  const href = abs ? url.replace(abs, '') : url;

  // /a/b -> a/b
  if (href[0] === '/') {
    return href.substring(1);
  }

  return href;
}

export function paramsToUrl(params: {
  [key: string]: string | number;
}): string {
  return Object.keys(params)
    ?.filter((key) => params[key] !== undefined)
    .map((key) => `${key}=${params[key]}`)
    .join('&');
}

// 建议使用下面的addQueryString
export function toUrl(
  url: string,
  params: { [key: string]: string | number }
): string {
  const search = paramsToUrl(params);
  return `${url}${url?.indexOf('?') === -1 ? '?' : '&'}${search || ''}`;
}

/**
 * 给url添加参数
 * @param url
 * @param params eg {a: 1, b: 2}
 * @returns
 */
export function addQueryString(url: string, params: object) {
  if (!params || typeof params !== 'object' || Object.keys(params).length < 1) {
    return url;
  }

  const tmpUrl = url || '';
  const urls = tmpUrl.split('#');
  let path = urls[0];
  const pound = urls[1];

  const data = {};
  if (path.indexOf('?') !== -1) {
    const paths = path.split('?');
    // eslint-disable-next-line prefer-destructuring
    path = paths[0];
    const qs = paths[1] || '';
    qs.split('&').forEach((v) => {
      if (v) {
        const obj = v.split('=');
        const key = obj[0];
        const val = obj[1];
        if (key) {
          data[key] = val || '';
        }
      }
    });
  }

  Object.keys(params).forEach((v) => {
    if (v) {
      data[v] = params[v] || '';
    }
  });

  const newQs = Object.keys(data).map((v) => `${v}=${data[v]}`);

  return `${path}?${newQs.join('&')}${pound ? `#${pound}` : ''}`;
}

/**
 * 是否http(s) url
 * @param {*} url
 * @return {Boolean}
 */
export function isHttpUrl(url: any) {
  return /^https?:\/\//i.test(url);
}

/**
 * 组合路径
 * @param paths
 *  ['https://tim.woa.com/', '/home', 'index'] -> https://tim.woa.com/home/index
 *  ['/', '/home'] -> /home
 *  ['', '/home'] -> /home
 */
export function combinePath(paths: string[]) {
  const count = paths.length;

  return paths
    .filter((v) => !!v)
    .map((path, i) => {
      let newPath = path || '';
      if (newPath.indexOf('/') === 0 && i !== 0) {
        newPath = newPath.substring(1);
      }

      const len = newPath.length;
      if (newPath.lastIndexOf('/') === len - 1 && i !== count - 1) {
        newPath = newPath.substring(0, len - 1);
      }

      return newPath;
    })
    .join('/');
}

/**
 * 拼接唤起App的路由
 * @param router
 * @returns
 */
export function getLaunchAppPath(router: string) {
  return `LaunchApp?info=${encodeURIComponent(router)}`;
}

/**
 * 获取中转页面地址，此地址走公网域名，不鉴权，只做平台判断后跳转到对应地址
 * @param options
 *  app: 跳转app的地址，自动encodeURIComponent
 *  web: 跳转web的地址，自动encodeURIComponent
 * @returns
 */
export function getRedirectUrl(options: { app?: string; web?: string }) {
  const { app, web } = options || {};
  const qs = [];

  if (app) {
    qs.push(`app=${encodeURIComponent(app)}`);
  }

  if (web) {
    qs.push(`web=${encodeURIComponent(web)}`);
  }

  return `app/redirect.html?${qs.join('&')}`;
}

/**
 * 获取路径，自动替换相对路径为完整的项目路径（自动添加ghostlogin、__env等参数）
 * @param url
 * @param params 需要拼接到url的参数
 * @param options
 *  {
 *    includeDomain: true, // 是否拼接域名，默认true
 *    isEntryEnv: false, // 是否作为入口地址使用，调试用，默认false（表示使用__env参数)， true时__env参数变更为_env，避免首页资源加载失败
 *  }
 * @param includeDomain 是否拼接域名，默认true
 * @returns
 */
export function getProjectUrl(
  url: any,
  params?: object,
  options?: { includeDomain?: boolean; isEntryEnv?: boolean }
) {
  if (!url || typeof url !== 'string') {
    return url;
  }

  let newUrl = null;

  const { includeDomain, isEntryEnv } = options || {};

  // 兼容 http(s)://、file://xxx、content://xxx、timapp://xxx 这种类型
  if (url.indexOf('://') !== -1) {
    newUrl = url;
  } else if (includeDomain === undefined || includeDomain === true) {
    // includeDomain默认为true
    newUrl = combinePath([location.origin, url]);
  } else {
    newUrl = url.indexOf('/') === 0 ? url : `/${url}`;
  }

  // 兼容调试，ghostlogin
  if (false && newUrl.indexOf('ghostlogin=') === -1) {
    const user = true;
    if (user) {
      newUrl = addQueryString(newUrl, { ghostlogin: user });
    }
  }

  if (params && isObject(params)) {
    return addQueryString(newUrl, { ...params });
  }

  return newUrl;
}
