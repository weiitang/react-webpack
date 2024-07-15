import { isInheritedOf, isEmpty, each } from 'ts-fns';
import {
  resolveUrl,
  revokeUrl,
  paramsToUrl,
  parseUrl,
  parseSearch,
} from '@src/utils/url';

const HISTORY_CLASSES = {};

export class History {
  stack: string[] = [];
  cursor = -1;
  events = [];

  get location() {
    const href = this.stack[this.cursor];
    if (!href) {
      return {
        href: '/',
        pathname: '/',
        search: '',
        query: {},
        hash: '',
      };
    }
    const { pathname, search, hash } = parseUrl(href);
    const query = parseSearch(search);
    return { href, pathname, search, query, hash };
  }

  constructor() {
    this.init();
  }

  init() {
    // should be override
  }

  on(name, fn) {
    this.events.push({ name, fn });
  }

  off(name, fn) {
    this.events = this.events.filter(
      (item) => !(item.fn === fn && item.name === name)
    );
  }

  emit(name, ...args) {
    this.events.forEach((item) => {
      if (item.name === name) {
        item.fn(...args);
      }
    });
  }

  back() {
    this.cursor -= 1;
    const url = this.stack[this.cursor];
    if (url) {
      this.emit('change', url);
    }
  }

  forward() {
    this.cursor += 1;
    const url = this.stack[this.cursor];
    if (url) {
      this.emit('change', url);
    }
  }

  push(url) {
    this.cursor += 1;
    this.stack.push(url);
    this.emit('change', url);
  }

  replace(url) {
    this.stack[this.cursor] = url;
    this.emit('change', url);
  }

  /**
   * 外部打开
   * @param url
   */
  open(url: string): void;
  open(): never {
    throw new Error('History.open必须被实现');
  }

  /**
   * get url to parse to state
   * @param {string} abs
   * @param {string} mode
   * @returns {string} path like: root/child/sub
   */
  getUrl(abs, mode) {
    const url = this.location.href;
    return this.$parseUrl(url, abs, mode);
  }
  $parseUrl(url, abs, mode) {
    const { base } = mode;
    return revokeUrl(base, revokeUrl(abs, url));
  }

  /**
   * url change work
   * @param {*} to
   * @param {*} type 进入类型，默认为push，设置为true或'replace'时是replace，设置为'open'时打开新窗口
   * @param {*} abs
   * @param {*} mode
   */
  setUrl(to, abs, mode, params, type?: boolean | 'replace' | 'open') {
    const url = this.makeUrl(to, abs, mode, params);
    if (type === 'open') {
      this.open(url);
      return;
    }
    if (type === true || type === 'replace') {
      this.replace(url);
      return;
    }
    this.push(url);
  }
  /**
   * create new url only changing search query
   * @param {*} abs
   * @param {*} mode
   * @param {*} params
   * @returns
   */
  $makeSearchUrl(params = {}) {
    const { pathname, query } = this.location;
    const nextQuery = { ...query, ...params };
    each(params, (value, key) => {
      if (value === null) {
        delete nextQuery[key];
      }
    });
    const nextSearch = paramsToUrl(nextQuery);
    const url = nextSearch ? `${pathname}?${nextSearch}` : pathname;
    return url;
  }
  /**
   * create url to patch to history
   * @param {*} to
   * @param {*} abs
   * @param {*} mode
   * @returns
   */
  makeUrl(to, abs, mode, params) {
    return this.$discernUrl(to, abs, mode, params);
  }
  $discernUrl(to, abs, mode, params) {
    if (to === '.') {
      return this.$makeSearchUrl(params);
    }

    const query = params ? { ...params } : {};
    const chain = to.split('/');
    chain.forEach((text, i) => {
      if (text.indexOf(':') === 0) {
        const key = text.substring(1);
        if (query[key]) {
          chain[i] = query[key];
          delete query[key];
        }
      }
    });
    const nextTo = chain.join('/');

    const genedSearch = isEmpty(query) ? '' : paramsToUrl(query);
    const search = genedSearch ? `?${genedSearch}` : '';

    // 直接带协议的url
    // http://xxx.com/xxx | //xxx.com/xxx
    if (/^[a-z]+:\/\//.test(nextTo) || /^\/\//.test(nextTo)) {
      return nextTo.indexOf('?') > -1
        ? `${nextTo}&${genedSearch}`
        : nextTo + search;
    }

    const { base } = mode;

    // 绝对路径
    // /a/b/c
    if (nextTo[0] === '/') {
      const root = resolveUrl(base, nextTo.substring(1));
      return root + search;
    }

    const root = resolveUrl(base, abs);
    const url = resolveUrl(root, nextTo);
    const res = url + search;
    return res;
  }

  static createHistory(type) {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const HistoryClass = HISTORY_CLASSES[type];
    if (!HistoryClass) {
      throw new Error(`不存在 ${type} 类型 History。`);
    }
    return new HistoryClass();
  }

  // eslint-disable-next-line @typescript-eslint/naming-convention
  static implement(type: string, Impl) {
    if (!isInheritedOf(Impl, History)) {
      throw new Error(
        '[Nautil]: History.impmenet should must given class inherit from History'
      );
    }
    HISTORY_CLASSES[type] = Impl;
  }
}

export class MemoHistory extends History {}
History.implement('memo', MemoHistory);
