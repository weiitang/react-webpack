enum ProjectNameEnum {
  Workflow = 'Workflow',
}

function getGlobalConfig() {
  return {
    ...{ projectName: ProjectNameEnum.Workflow },
  };
}

enum STORAGE_KEY {
  LANGUAGE = 'LANGUAGE', // 语言key
  GHOSTLOGIN = 'GHOSTLOGIN', // ghostlogin
  GHOSTLOGIN_HISTORY = 'GHOSTLOGIN_HISTORY', // login 历史 用于切换时记录
  WORKFLOW_RELEASE_TMP_XML = 'WORKFLOW_RELEASE_TMP_XML', // 流程配置缓存流程图，页面跳转缓存使用
  WORKFLOW_CACHE = 'WORKFLOW_CACHE', // 流程配置未正常退出的缓存数据
  WORKFLOW_CACHE_EDIDING = 'WORKFLOW_CACHE_EDIDING', // 流程配置本次操作的缓存数据
  SHOW_SIGNOFF_SCHEDULE_ALERT = 'SHOW_SIGNOFF_SCHEDULE_ALERT', // 进入签署窗口页面时是否弹出说明
  DRAFT_PERMISSIONS = 'DRAFT_PERMISSIONS', // 角色管理角色组的草稿
  PRO_TABLE_PERSISTENCE = 'PRO_TABLE_PERSISTENCE', // 列表页持久化
  PAYMENT_LIST_INVESTMENT_TYPE = 'PAYMENT_LIST_INVESTMENT_TYPE', // 付款列表的付款类型筛选项
  AEGIS_UIN = 'AEGIS_UIN', // aegis上报用户UIN
  UPGRADE_NOTICE = 'UPGRADE_NOTICE', // 升级提示
  STOCKS_COLOR = 'STOCKS_COLOR', // 股票涨跌幅颜色
  WEBSITE_NOTICE = 'WEBSITE_NOTICE', // 站点公告
  TOKEN = 'TOKEN', // 有些站点需要token
  AUTH_SUCCESS_TIMESTAMP = 'AUTH_SUCCESS_TIMESTAMP', // 请求鉴权成功的时间戳
}
export { STORAGE_KEY };

const { projectName } = getGlobalConfig();
const nameSpace = `@${projectName}`;

export const getKey = (key: string) => `${nameSpace}-${key}`;

/**
 * 写
 * @param key
 * @param value
 * @param force 是否强制写入
 * @returns
 */
export const setLocal = (
  key: STORAGE_KEY | string,
  value: any,
  force?: boolean
) => {
  if (!force && !Object.values(STORAGE_KEY).includes(key as STORAGE_KEY)) {
    console.warn(`${key}在STORAGE_KEY中未声明，请在localStorage文件中声明`);
    return;
  }

  // 使用对象存储，保留原输入类型
  // JSON.stringify({v: undefined}) -> {}
  // JSON.stringify({v: null}) -> {v:null}
  // 值为undefined时，key会被移除，所以添加_t作为标记位
  const data = {
    _t: 1,
    v: value,
  };
  localStorage.setItem(getKey(key), JSON.stringify(data));
};

export const getLocal = (key: STORAGE_KEY | string, defaultVal: any = null) => {
  const val = localStorage.getItem(getKey(key));

  try {
    const objValue = JSON.parse(val as any);
    if (Object.prototype.hasOwnProperty.call(objValue, '_t')) {
      return objValue.v;
    }
  } catch (e) {}

  return defaultVal;
};

export const clearLocal = (key: STORAGE_KEY | string) => {
  localStorage.removeItem(getKey(key));
};
