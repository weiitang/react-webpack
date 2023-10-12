// a-hooks
// 理论上性能比useEvent好一点，不会在每个useLayoutEffect都执行赋值，不过觉得区别不大
import React from 'react';

type Noop = (this: any, ...args: any[]) => any;

export function useMemoizedFn<T extends Noop>(fn: T): T {
  const fnRef = React.useRef<T>(fn);
  React.useMemo(() => (fnRef.current = fn), [fn]);

  const memoizedFn = React.useRef<T>(fn);
  if (!memoizedFn.current) memoizedFn.current = fnRef.current;

  return memoizedFn.current as T;
}
