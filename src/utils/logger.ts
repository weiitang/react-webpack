/* eslint-disable no-console */
import cloneDeep from 'lodash/cloneDeep';

const color = {
  blue: '#0074D9',
  red: '#FF4136',
  pink: '#B10DC9',
  orange: '#FF851BB0',
  green: '#3D9970',
  green2: '#7fb80e',
  gray: '#74787c',
  yellow: '#F9CE00',
};

interface IContent {
  config: any;
  params: any;
  data?: any;
  rid: number;
}

const logger = {
  logRequest(content: IContent) {
    const { config, params, rid } = content;
    console.groupCollapsed(
      `%cRequest-${rid}%c %c${config.method} ${config.summary} ${config.url}`,
      'color: white; background-color: #0074D9B0; padding: 2px 5px; border-radius: 2px',
      '',
      `color: ${color.blue}`
    );
    console.log(
      `%c url: ${config.url} \n params: %O`,
      `color: ${color.blue}`,
      params
    );
    console.groupEnd();
  },

  logResponse(content: IContent) {
    const { config, params, data, rid } = content;
    console.groupCollapsed(
      `%cResponse-${rid}%c %c${config.method} ${config.summary} ${config.url}`,
      'color: white; background-color: #3D9970B0; padding: 2px 5px; border-radius: 2px',
      '',
      `color: ${color.green}`
    );
    console.log(
      `%c url: ${config.url} \n params: %O \n data: %O`,
      `color: ${color.green}`,
      params,
      cloneDeep(data)
    );
    console.groupEnd();
  },

  logErrorResponse(content: IContent) {
    const { config, params, data, rid } = content;
    console.groupCollapsed(
      `%cResponse-${rid}%c %c${config.method || 'get'} ${config.summary} ${
        config.url
      }`,
      'color: white; background-color: #FF4136B0; padding: 2px 5px; border-radius: 2px',
      '',
      `color: ${color.red}`
    );
    console.log(
      `%c url: ${config.url} \n params: %O \n data: %O`,
      `color: ${color.red}`,
      params,
      cloneDeep(data)
    );
    console.groupEnd();
  },

  logHitCache(content: IContent) {
    const { config, params, data, rid } = content;
    console.groupCollapsed(
      `%cCache-${rid}%c %c${config.method || 'get'} ${config.summary}`,
      'color: white; background-color: #B10DC9B0; padding: 2px 5px; border-radius: 2px',
      '',
      `color: ${color.pink}`
    );
    console.log(
      `%c url: ${config.url} \n params: %O \n data: %O`,
      `color: ${color.pink}`,
      params,
      cloneDeep(data)
    );
    console.groupEnd();
  },

  logMockResponse(content: IContent) {
    const { config, params, data, rid } = content;
    console.groupCollapsed(
      `%cMock-${rid}%c %c${config.method} ${config.summary} ${config.url}`,
      'color: white; background-color: #FF851BB0; padding: 2px 5px; border-radius: 2px',
      '',
      `color: ${color.orange}`
    );
    console.log(
      `%c url: ${config.url} \n params: %O \n data: %O`,
      `color: ${color.orange}`,
      params,
      cloneDeep(data)
    );
    console.groupEnd();
  },

  logActionChange(key: string, oldValue: any, newValue: any) {
    console.log(
      `%cAction-${key}%c \n prev store: %O %c\n next store: %O`,
      `color: white; background-color: ${color.yellow}; padding: 2px 5px; border-radius: 2px`,
      `color: ${color.gray}`,
      oldValue,
      `color: ${color.green2}`,
      newValue
    );
  },

  logDiff(params: { label?: string; keys: string[]; content: any }) {
    const { label, keys, content } = params;
    console.groupCollapsed(
      `%c Diff ${label} %c %c ${keys.join(',')}`,
      'color: white; background-color: #ED7B2F; padding: 2px 5px; border-radius: 2px',
      '',
      `color:${color.blue}`
    );
    console.log(content);
    console.groupEnd();
  },
};

export default logger;
