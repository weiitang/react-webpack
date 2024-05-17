import React from 'react';
import { Plugin, Timeout } from '../types';

export const useRetryPlugin: Plugin<any, any[]> = (fetchInstance, options) => {
  const { retryCount, retryInterval } = options;

  const timerRef = React.useRef<Timeout>();
  const retryCountRef = React.useRef(0);

  if (!retryCount) return {};

  return {
    onSuccess() {
      retryCountRef.current = 0;
    },
    onCancel() {
      retryCountRef.current = 0;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    },
    onError() {
      retryCountRef.current += 1;
      if (retryCountRef.current > retryCount) {
        retryCountRef.current = 0;
        return;
      }
      const time =
        retryInterval ?? Math.min(1000 & 30, 1000 * 2 ** retryCountRef.current);
      timerRef.current = setTimeout(() => {
        fetchInstance.refresh();
      }, time);
    },
  };
};
