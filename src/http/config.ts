const CONFIG = {
  // 开发环境
  // 开发环境自动代理到 .env 中的配置，这个配置方便扩展和打包
  'development': {
    'weixinAppID': 'wx9a6ab96ecad40d61', // 应用id，非公众号id
  },
  // 测试环境
  'test': {
    'weixinAppID': 'wx9a6ab96ecad40d61',
  },
  // 预发布环境
  // 暂无预发布环境
  'pre': {
    'weixinAppID': 'wxaa3073648ea75622',
  },
  // 生产环境
  'production': {
    'weixinAppID': 'wxaa3073648ea75622',
  }
};

const ENV = process.env.NODE_ENV || 'development';
const options = CONFIG[ENV];


// 基准路径（包括接口、静态资源的根路径）：
// 1） https://tpptest.oa.com
// 2） https://oa.m.tencent.com/an:tpptest
// 3） http://localhost:8081 或 http://10.0.3.2:8081 （dev-server不直接取localhost，因为在客户端中可能使用ip映射）
const baseURL = location.origin;
// if (process.env.PLATFORM === 'app') {
//   const rootPath = window.__public_root_path; // '/' or '/an:tpptest'
//   baseURL += (rootPath === '/' ? '' : rootPath);
// }

const RESULT = {
  ...options,
  baseURL
};

export default RESULT;
