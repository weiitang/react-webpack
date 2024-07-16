import i18next from 'i18next';
import shared from './shared.json';

export function initConfig() {
  [shared].forEach((config) => {
    Object.keys(config.langs).forEach((lang) => {
      i18next.addResources(lang, config.namespace, config.langs[lang]);
    });
  });
}
