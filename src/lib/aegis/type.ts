export enum LogType {
  API_RESPONSE = '1', // 白名单中的用户，页面上的所有 API 返回都将会被上报
  INFO = '2', // aegis.info、aegis.infoAll 上报的日志
  ERROR = '4', // js 错误
  PROMISE_ERROR = '8', // promise 错误
  AJAX_ERROR = '16', // ajax 错误
  SCRIPT_ERROR = '32', // script 加载失败
  IMAGE_ERROR = '64', // 图片加载失败
  CSS_ERROR = '128', // css 加载失败
  CONSOLE_ERROR = '256', // console.error 监控（目前暂未支持）
  MEDIA_ERROR = '512', // 音视频加载失败
  RET_ERROR = '1024', // retcode 返回码异常
  REPORT = '2048', // aegis.report 上报日志默认level
  PV = '4096', // 页面 PV
  EVENT = '8192', // 自定义事件
  PAGE_NOT_FOUND_ERROR = '16384', // 小程序 页面不存在
  WEBSOCKET_ERROR = '32768', // websocket错误
  BRIDGE_ERROR = '65536', // js bridge 错误
}

type ICustomEvent = {
  /**
   * 上报模块的类型 + 上报模块名称 + 自定义上报事件名称
   * @example component.editor.parseWordFile
   */
  name: string;
  /**
   * 额外的备注信息，用于自定义事件日志检索
   */
  remark?: string | object;
  /**
   * 时间类型，Aegis.logType 枚举值
   */
  level?: LogType;
};

type ICustomTime = {
  /**
   * 自定义测速名称
   */
  name: string;
  /**
   * 自定义测速耗时(0 - 60000)
   */
  duration: number;
  /**
   * 测速代码所在的文件路径
   * @example
   * '如：src/components/upload/upload.tsx'
   */
  path?: string;
  /**
   * 额外的备注信息，用于自定义事件日志检索
   */
  remark?: string;
};

// 自定义上报类型
export enum EventName {
  CLICK = 'click',
  PAGE = 'page',
  ERROR = 'error',
  JS_ERROR = 'js_error',
  USER_CACHE = 'user_cache', // 命中userme接口信息缓存
  APP_STATE_CHANGE = 'app.state', // app状态变化
  OPENURL_SUCCESS = 'openUrl.success', // 打开第三方url成功
  OPENURL_ERROR = 'openUrl.error', // 打开第三方url失败
  NETWORK_UNCONNECTED = 'network.unconnected', // 网络无连接
  NETWORK_CHANGE = 'network.change', // 网络状态变化
  EDITOR_PARSEWORDFILE = 'component.editor.parseWordFile', // 富文本编辑器解析文档
  NO_AUTHORIZATION = 'legal_database.no_authorization',
  AUTH_FAILURE = 'auth_failure', // 鉴权失败401
  CLAUSE = 'clause',
  H5_FPS = 'h5.fps',
  APP_FPS = 'app.fps',
  PC_FPS = 'pc.fps',
  APP_MEMORY = 'app.memory',
  FPS_120HZ = 'app.fps.120hz',
  FPS_60HZ = 'app.fps.60hz',
}

export type { ICustomEvent, ICustomTime };
