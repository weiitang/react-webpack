import { from, Subject, switchMap, debounceTime } from 'rxjs';

export type Request<T, S> = (data: T) => Promise<S>;

/**
 * @description 实现一个请求队列，连续多个请求在短时间内发出，如果当前请求还未返回，下一个请求已经发出，则忽略请一个请求的结果，永远只使用最新请求的结果
 * @param request http请求方法，比如返回promis
 * @param cb http请求返回后的回调函数
 * @param debounce 防抖时间
 * @returns
 */
export function createRequestQueue<T, S>(
  request: Request<T, S>,
  cb: (data: S) => void,
  debounce = 1000
) {
  const subject = new Subject<T>();
  subject
    .pipe(debounceTime(debounce))
    .pipe(
      switchMap((value) => {
        const requestPromise = request(value);
        return from(requestPromise);
      })
    )
    .subscribe((value) => {
      cb(value);
    });
  return subject;
}
