import i18n from 'i18next';
import dayjs from 'dayjs';
import dayjsEn from 'dayjs/locale/en';
import dayjsZh from 'dayjs/locale/zh-cn';
import enConfig from 'tdesign-react/es/locale/en_US';
import zhConfig from 'tdesign-react/es/locale/zh_CN';
import intervalPlural from 'i18next-intervalplural-postprocessor';
import { LanguageType, $i18next } from '@/i18n';
import { getLocal, setLocal, STORAGE_KEY } from '@src/lib/localStorage';

export const tdConfig = getLanguage() === 'en' ? enConfig : zhConfig;

export function getLanguage(): LanguageType {
  // 可以根据不同模块放开国际化
  if (true) {
    const lang = getLang();
    if (lang === 'en') {
      // html添加lang=en 便于样式设置字体
      if (document?.documentElement?.getAttribute?.('lang') !== 'en') {
        document?.documentElement?.setAttribute?.('lang', 'en');
      }
    }
    return lang;
  }
}

function getLang() {
  const language = getLocal(STORAGE_KEY.LANGUAGE);
  if (language) {
    return language;
  }

  // const browserLang = navigator.language ? navigator.language : 'zh';
  // if (browserLang.indexOf('en') > -1) {
  //   return 'en';
  // }
  // if (browserLang.indexOf('zh') > -1) {
  //   return 'zh';
  // }
  return 'en';
}

function t(text: string, options?: any) {
  // 解析word
  const wordArr = text.split(':');
  const namespace = wordArr[0];
  const word = wordArr[1];
  const defaultValue = wordArr[2];
  const key = `${namespace}:${word}`;
  // 有词条
  if (i18n.exists(key)) {
    return i18n.t(key, options);
  }

  try {
    // 没有添加词条再次尝试
    const lang = getLanguage();
    i18n.addResource(lang, namespace, word, defaultValue);
    if (i18n.exists(key)) {
      return i18n.t(key, options);
    }
    // 还是没有进行前端拼接
    const replacedValue = defaultValue?.replace(
      /{{([^{}]+)}}/g,
      (match, _key) => options?.[_key.trim()] || match
    );
    return replacedValue;
  } catch {
    return defaultValue;
  }
}

function setLanguage(lang: string) {
  setLocal(STORAGE_KEY.LANGUAGE, lang);
  location.reload();
}

type Config = {
  namespace: string;
  langs: {
    zh: Record<string, string>;
    en: Record<string, string>;
  };
};

export function initI18n(i18nConfigList: Config[]) {
  $i18next.init(
    {
      getLanguage,
      setLanguage,
      t,
    },
    () => {
      const lang = getLanguage();
      dayjs.locale(lang, lang === 'en' ? dayjsEn : dayjsZh);
      i18n.use(intervalPlural).init({
        // ns: ['common'],
        // defaultNS: 'common',
        // https://www.i18next.com/how-to/add-or-load-translations
        resources: {
          en: {},
          zh: {},
        },
        // debug: true,
        lng: lang,
        fallbackLng: ['zh', 'en'], // use en if detected lng is not available
        keySeparator: false, // we do not use keys in form messages.welcome
        interpolation: {
          escapeValue: false, // react already safes from xss
        },
      });
      i18nConfigList.forEach((config) => {
        Object.keys(config.langs).forEach((lang) => {
          i18n.addResources(lang, config.namespace, config.langs[lang]);
        });
      });
    }
  );
}
