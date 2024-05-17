import React from 'react';
import { useMemoizedFn } from '../../';
import { Plugin } from '../types';

const ABORT_REASON = 'Has a new request';

export const useAbortPlugin: Plugin<any, any> = (fetchInstance, options) => {
  const { abortBeforeRequire, customAbortParams, onAbort } = options;
  const abortRef = React.useRef<AbortController | null>();

  const handleAbort = useMemoizedFn((params) => {
    if (!abortRef.current) return;
    fetchInstance.runPluginEvent('onAbort', params);
    onAbort?.(params);
    abortRef.current?.abort(ABORT_REASON);
    abortRef.current = null;
  });

  const injectAbort = useMemoizedFn((params, abort) => {
    if (params?.[0]) {
      // eslint-disable-next-line no-param-reassign
      params[0].abort = abort;
    }
    return params;
  });

  if (!abortBeforeRequire) return {};
  return {
    onBefore(params) {
      // 回调写在 插件里会不会不太好？
      handleAbort(params);
      const abort = new AbortController();
      abortRef.current = abort;

      return {
        params: customAbortParams
          ? customAbortParams(params, abort)
          : injectAbort(params, abort),
      };
    },

    onCancel(params) {
      handleAbort(params);
    },

    onFinally() {
      abortRef.current = null;
    },
  };
};
