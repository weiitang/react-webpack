import { isPlainObject, isString } from 'lodash';
import { EventName } from '@src/lib/aegis/type';
import { ICustomEvent, ICustomTime } from './type';
let aegisInstance = null;

function setAegisInstance(instance) {
  aegisInstance = instance;
}

// 无需上报的url
const reportWhiteList = ['/api/v1/fields/all'];

const { hasOwnProperty } = Object.prototype;

const scriptErrorReg = new RegExp('Script error .|Script error.');
// https://stackoverflow.com/questions/49384120/resizeobserver-loop-limit-exceeded
const ignoreErrors =
  /(ResizeObserver loop limit exceeded)|(ResizeObserver loop completed with undelivered notifications.)/;

/**
 * api相关配置
 */
const shareAegisConfig = {
  apiDetail: false,
  reportApiSpeed: true, // 接口测速
  offlineLog: false, // 是否开启离线日志
  api: {
    retCodeHandler: (obj: any, url: string) => {
      if (reportWhiteList.findIndex((ign) => url?.indexOf(ign) !== -1) !== -1) {
        return {
          isErr: false,
          code: 'unknown',
        };
      }

      let responseData = null;
      if (isPlainObject(obj)) {
        responseData = obj;
      } else if (obj) {
        try {
          responseData = JSON.parse(obj);
        } catch (e) {}
      }

      // 符合业务规范的响应才处理，其他的都不上报
      if (
        responseData &&
        hasOwnProperty.call(responseData, 'code') &&
        hasOwnProperty.call(responseData, 'data') &&
        hasOwnProperty.call(responseData, 'msg')
      ) {
        return {
          isErr: responseData.code !== 100000,
          code: responseData.code,
        };
      }

      return {
        isErr: false,
        code: 'unknown',
      };
    },
  },
  beforeRequest: (data) => {
    if (data.logType === 'log' && scriptErrorReg.test(data.logs.msg)) {
      return false;
    }
    if (data.logType === 'log' && ignoreErrors.test(data.logs.msg)) {
      return false;
    }
    // if (data.logType === 'log' && data.log.msg.indexOf('res status: 0') > -1) {
    //   return false;
    // }
    return data;
  },
};

/**
 * 传入配置对象
 */
function setConfig(aegisConfig: any) {
  aegisInstance?.setConfig({ ...aegisConfig });
}

/**
 * 设置用户UIN
 * 在用户登陆之后调用
 * @param rtx 用户唯一标识
 * @returns
 */
function setUIN(rtx: string) {
  aegisInstance?.setConfig({
    uin: rtx,
  });
}

/**
 * 主动上报
 * @param aegisObj
 */
function report(aegisObj: any) {
  setTimeout(() => {
    aegisInstance?.report(aegisObj);
  }, 0);
}

/**
 * 主动上报错误
 * @param error Error实例或字符串
 * @param info 可选，额外用于error trace的信息
 * @returns
 * 如果引入了跨域的 JS 脚本，请先尝试给对应的 script 标签添加 crossorigin 属性自动收集错误
 */
function reportError(error: Error | string, info?: any) {
  setTimeout(() => {
    const errorMsg = `主动上报：${error}`;
    const ext = info && info !== 0 ? JSON.stringify(info) : undefined;
    aegisInstance?.error({
      msg: errorMsg,
      ext2: ext,
    });

    // 同步上报到自定义事件中 便于查询问题
    aegisInstance?.reportEvent({
      name: EventName.JS_ERROR,
      ext2: isString(errorMsg) ? errorMsg : `${errorMsg}`,
    });
  }, 0);
}

/**
 * 自定义事件上报
 * 用于埋点统计某些功能的使用情况
 * @returns
 */
function reportEvent(options: ICustomEvent) {
  setTimeout(() => {
    aegisInstance?.reportEvent({
      name: options?.name,
      ext2: isString(options?.remark)
        ? options?.remark
        : JSON.stringify(options?.remark),
    });
  }, 0);
}

/**
 * 自定义测速
 * 用于埋点统计某些功能的耗时
 * @returns
 */
function reportTime(options: ICustomTime) {
  setTimeout(() => {
    aegisInstance?.reportTime({
      name: options?.name,
      duration: options?.duration,
      ext2: options?.path,
      ext3: options?.remark,
    });
  }, 0);
}

/**
 * 区间自定义测速
 * @returns
 * @example
 * import { reportTimeStart,reportTimeEnd }
 * reportTimeStart('complexOperation')
 * 做了很久的复杂操作之后。
 * reportTimeEnd('complexOperation')
 */
function reportTimeStart(operationName: string) {
  aegisInstance?.time(operationName);
}
function reportTimeEnd(operationName: string) {
  aegisInstance?.timeEnd(operationName);
}

export {
  shareAegisConfig,
  setAegisInstance,
  setUIN,
  setConfig,
  report,
  reportError,
  reportEvent,
  reportTime,
  reportTimeStart,
  reportTimeEnd,
};
