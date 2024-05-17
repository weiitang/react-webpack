import { cloneDeep } from 'lodash';
import React from 'react';
import { Plugin } from '../types';

export const useLoadMorePlugin: Plugin<any, any[]> = (
  fetchInstance,
  options
) => {
  const { customLoadMoreParams, customComplete } = options;
  const requestId = React.useRef<number>();
  const prevData = React.useRef<any>();

  return {
    onBefore() {
      requestId.current = fetchInstance.requireId;
      prevData.current = fetchInstance.state.data;
    },

    onLoadMore(params) {
      const { complete, loadingMore, loading } = fetchInstance.state;
      if (complete || loadingMore || loading) {
        return {
          stopNow: true,
        };
      }

      let nextLoadMoreParams = cloneDeep(params);
      if (customLoadMoreParams) {
        nextLoadMoreParams = customLoadMoreParams(nextLoadMoreParams);
      } else {
        if (!params || typeof params[0].current !== 'number') {
          throw new Error(`loadMorePlugin params error: ${params}`);
        }

        nextLoadMoreParams[0].current += 1;
      }

      return {
        loadMoreParams: nextLoadMoreParams,
      };
    },

    onResponse(res) {
      const nextData = res;
      // hack
      if (
        requestId.current === fetchInstance.requireId &&
        fetchInstance.state.loadingMore
      ) {
        // eslint-disable-next-line no-param-reassign
        nextData.records = [
          ...(fetchInstance.state.data?.records ?? []),
          ...res.records,
        ];
      }
      return {
        data: nextData,
      };
    },

    onSuccess(data) {
      const { loadingMore, complete: prevComplete } = fetchInstance.state;
      let complete = prevComplete;
      if (customComplete) {
        complete = customComplete(loadingMore, data);
      } else if (data?.current !== undefined && data.pages !== undefined) {
        complete = data.current >= data.pages;
      }

      if (fetchInstance.state.complete !== complete) {
        fetchInstance.setState({
          complete,
        });
      }
    },

    onRefresh(refreshParams, params) {
      const { useDefaultParams } = refreshParams;
      if (useDefaultParams) return;
      if (params?.[0]?.current) {
        // 重置current
        // eslint-disable-next-line no-param-reassign
        params[0].current = 1;
      }
    },

    onCancel() {
      requestId.current = null;
      prevData.current = null;
    },
  };
};
