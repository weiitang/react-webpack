/**
 * 是否调试模式
 * @return {Boolean}
 */
export function isDebug() {
  return ['development', 'test'].indexOf(process.env.NODE_ENV as string) !== -1;
}
