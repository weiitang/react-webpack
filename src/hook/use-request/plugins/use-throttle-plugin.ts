/* eslint-disable no-param-reassign */
import type { ThrottleSettings, DebouncedFunc } from 'lodash';
import { throttle } from 'lodash';
import React from 'react';
import { Plugin } from '../types';

export const useThrottlePlugin: Plugin<any, any> = (fetchInstance, options) => {
  const { throttleLeading, throttleTrailing, throttleWait } = options;
  const throttleRef = React.useRef<DebouncedFunc<any>>();
  const setting: ThrottleSettings = React.useMemo(() => {
    const o: ThrottleSettings = {};
    if (throttleLeading !== undefined) o.leading = throttleLeading;
    if (throttleTrailing !== undefined) o.trailing = throttleTrailing;
    return o;
  }, [throttleLeading, throttleTrailing]);

  React.useEffect(() => {
    if (!throttleWait) {
      throttleRef.current?.cancel();
      return;
    }

    throttleRef.current = throttle((cb) => cb(), throttleWait, setting);
    const originRunAsync = fetchInstance.runAsync.bind(fetchInstance);

    fetchInstance.runAsync = (...args) =>
      new Promise((resolve, reject) => {
        throttleRef.current?.(() =>
          originRunAsync(...args)
            .then(resolve)
            .catch(reject)
        );
      });

    return () => {
      throttleRef.current?.cancel();
      fetchInstance.runAsync = originRunAsync;
    };
  }, [throttleWait, setting, fetchInstance]);

  if (!throttleWait) return {};

  return {
    onCancel() {
      throttleRef.current?.cancel();
    },
  };
};
