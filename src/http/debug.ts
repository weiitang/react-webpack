/**
 * 调试相关
 */

import qs from 'qs';

const parsed = qs.parse(location.search, { ignoreQueryPrefix: true });


/**
 * 获取ghostlogin用户
 * @return {String}
 */
export function getGhostUser() {
  if (parsed.ghostlogin) {
    return parsed.ghostlogin;
  }

  // App使用的是sessionStorage，PC使用的是localStorage
  // const isApp = process.env.PLATFORM === 'app';
  const isApp = false;
  let user: any = isApp
    ? sessionStorage.getItem('TPP_DEBUG_USER')
    : localStorage.getItem('TPP_DEBUG_USER');

  user = user ? JSON.parse(user) : null;
  user = user ? user?.user_name_en : null;

  // App请求时添加默认用户参数；
  // 但需要排除非开发环境的情况，避免登录后不是本人
  // 只对以下情况添加
  // 1. 本地调试
  // 2. 客户端中调试本地网页（开发环境），避免App进入时无法登录
  if (isApp && !user && process.env.NODE_ENV === 'development') {
    user = 'tiramisu';
  }

  return user;
}
