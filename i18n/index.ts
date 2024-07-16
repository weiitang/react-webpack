/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import { initConfig } from './config';
abstract class BaseI18n {
  // 因为目前tim强制返回中文，所以加force可以切换语言
  abstract getLanguage: (force?: boolean) => string;
  abstract setLanguage: (lang: string) => void;
  abstract t: (text: string, options?: any) => string;
}

class I18n extends BaseI18n {
  getLanguage = (_force?: boolean): any => 'zh';
  setLanguage = (_lang: string) => {};
  t = (_text: string, _options?: any) => {
    // 解析word
    const wordArr = _text.split(':');
    const defaultValue = wordArr[2];
    console.warn('国际化没有正确初始化！请检查初始化配置');
    return defaultValue || _text;
  };

  init(options, callback?: () => void) {
    callback?.();
    initConfig();
    this.setLanguage = options.setLanguage;
    this.getLanguage = options.getLanguage;
    this.t = options.t;
  }
}

const $i18next = new I18n();

export enum Language {
  Zh = 'zh',
  En = 'en',
}

export type LanguageType = 'zh' | 'en';

export { $i18next };
