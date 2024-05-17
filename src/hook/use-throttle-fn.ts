import throttle from 'lodash/throttle';
import * as React from 'react';

const useThrottleFn = <T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
  ...args
): T => {
  const callback = React.useCallback(fn, [...args]);
  const throttledCallback = React.useCallback(throttle(callback, delay), [
    ...args,
  ]);
  React.useEffect(
    () => () => {
      throttledCallback.cancel();
    },
    []
  );
  return throttledCallback as unknown as T;
};

export { useThrottleFn };
