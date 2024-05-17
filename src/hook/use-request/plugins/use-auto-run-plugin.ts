import { isBoolean } from 'lodash';
import React from 'react';
import type { Plugin } from '../types';
import { usePrevious, useUpdateEffect } from '../..';

export const useAutoReturnPlugin: Plugin<any, any[]> = (
  fetchInstance,
  options
) => {
  const {
    refreshDeps = [],
    refreshDepsAction,
    ready = true,
    manual,
    defaultParams = [],
    initializeLoading,
  } = options;

  const hasRun = React.useRef(false);
  const prevReady = usePrevious(ready);
  const refRefreshDepsAction = React.useRef(refreshDepsAction);
  refRefreshDepsAction.current = refreshDepsAction;

  useUpdateEffect(() => {
    if (hasRun.current) return;
    if (ready && !manual) {
      hasRun.current = true;
      fetchInstance.run(...defaultParams);
    }
  }, [ready, manual]);

  useUpdateEffect(() => {
    if (ready && isBoolean(initializeLoading)) {
      fetchInstance.setState({ loading: initializeLoading });
    }
  }, [ready]);

  useUpdateEffect(() => {
    // 防止ready, manual, refreshDeps 同时改变触发多次
    if (!prevReady && ready) return;
    if (!manual) runRefresh();

    async function runRefresh() {
      hasRun.current = true;
      if (refreshDepsAction) {
        fetchInstance.setState({
          refreshing: true,
        });
        await refreshDepsAction();
        fetchInstance.setState({
          refreshing: false,
        });
      } else {
        fetchInstance.refresh();
      }
    }
  }, refreshDeps);

  return {
    onBefore() {
      if (!ready) {
        return {
          stopNow: true,
        };
      }
    },
  };
};

useAutoReturnPlugin.onInit = ({ ready = true, manual, initializeLoading }) => {
  if (!ready) return { loading: false };
  return {
    loading: isBoolean(initializeLoading) ? initializeLoading : !manual,
  };
};
