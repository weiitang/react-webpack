/* eslint-disable no-console */
/* eslint-disable no-undefined */
/* eslint-disable no-shadow */
import axios from 'axios';
import { cacheAdapterEnhancer } from 'axios-extensions';
import baseConfig from './config';
import { getGhostUser } from './debug';
import { isDebug, isProjectUrl, flatObject } from './utils';
import qs from 'qs';
// import i18n from 'i18next'

const axiosOptions: any = {};

const customHeaders = {
  'Cache-Control': 'no-cache',
  // 'Tpp-Language': i18n.language || 'en'
};

const instance = axios.create({
  baseURL: baseConfig.baseURL + '/api/',
  timeout: 60 * 1000,
  headers: customHeaders,
  adapter: cacheAdapterEnhancer(axios.defaults.adapter as any, { enabledByDefault: false, cacheFlag: 'useCache' })
});

/**
 * 缓存一些全局配置
 * @param {Object} options 格式已axios定义为准，然后做merge操作
 */
function setOptions(options) {
  Object.assign(axiosOptions, options);
}

// 这里在request前附加这些参数
instance.interceptors.request.use((config: any) => {
  // create时可能还没配置axiosOptions，所以这里动态设置
  // config.headers = Object.assign({}, config.headers, axiosOptions.headers)
  // config = Object.assign({}, axiosOptions, config)

  // create时可能还没配置axiosOptions，所以这里动态设置
  config.headers = Object.assign(config.headers, axiosOptions.headers);


  // 开发测试调试用
  if (isDebug() && isProjectUrl(config.url) && config.url.indexOf('ghostlogin=') === -1) {
    config.params = Object.assign({}, {
      ghostlogin: getGhostUser()
    }, config.params);
  }

  // 后台不支持PUT/PATCH/DELETE请求，需要转义
  const method = config.method;
  let data = config.data;
  if (method === 'put' || method === 'patch' || method === 'delete') {
    if (data instanceof FormData) {
      data.append('_method', method);
    } else if (typeof data !== 'string') {
      data = Object.assign({}, data, { _method: method });
    }

    config.method = 'post';
  }

  if (config.method === 'post') {
    const formType = 'application/x-www-form-urlencoded';
    const contentType = config.headers.post['Content-Type'];

    // 自动将带File对象的data参数转换为FormData对象
    if (!(data instanceof FormData)) {
      const flatObj = flatObject(data);
      const hasFile = Object.values(flatObj).find(v => v instanceof File);
      if (hasFile) {
        const formData = new FormData();
        Object.keys(flatObj).forEach(key => {
          const value = flatObj[key];

          // FormData形式传入null会变成字符串
          if (value !== null && value !== undefined) {
            formData.append(key, value);
          }
        });

        data = formData;
        config.data = data;
      }
    }


    if (data instanceof FormData && contentType.indexOf(formType) !== -1) {
      config.headers.post['Content-Type'] = 'multipart/form-data';
    }

    // application/x-www-form-urlencoded格式
    else if (contentType.indexOf(formType) !== -1) {
      config.data = qs.stringify(data);
    }
  }

  return config;
});

instance.interceptors.response.use(response => {
  // 业务API响应，非10000都当做异常; 存在code即认为是业务API响应格式，保留__ignore参数忽略次处理逻辑
  // 其他响应，直接返回
  //
  // 存在_ignore参数，则不处理响应格式
  // 适用于自定义JSON等一些场景，例如App version.json
  console.log('use', response);
  const params = response.config.params;
  const ignoreResponse = !params || params.__ignore === undefined;
  const responseData = response.data;

  if (typeof responseData === 'object'
    && responseData !== null
    && responseData.code !== undefined
    && ignoreResponse) {
    const { code, data, error } = responseData;
    if (code === 100000) {
      return Promise.resolve(data);
    } else {
      return Promise.reject(new Error(error));
    }
  } else {
    return Promise.resolve(responseData);
  }

}, (e) => {
  console.log('eee', e);
  const error = new Error('错误');
  return Promise.reject(error);
});

export {
  setOptions,
  instance,
};
