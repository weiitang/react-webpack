/* eslint-disable @typescript-eslint/ban-ts-comment */
import React from 'react';
import {
  useCreation,
  useUpdate,
  useMount,
  useUnmount,
  useMemoizedFn,
  useUpdateEffect,
} from '..';
import { Fetch } from './fetch';
import type { Options, Plugin, Service, RequestImplementReturn } from './types';

export function useRequestImplement<TData, TParams extends any[]>(
  service: Service<TData, TParams>,
  options: Options<TData, TParams> = {},
  plugins: Plugin<TData, TParams>[] = []
): RequestImplementReturn<TData, TParams> {
  const { manual = false, ...restOptions } = options;
  const serviceRef = React.useRef(service);
  useUpdateEffect(() => {
    serviceRef.current = service;
  }, [service]);

  const fetchOptions = {
    manual,
    ...restOptions,
  };
  const update = useUpdate();
  const fetchInstance = useCreation(() => {
    const initState = plugins
      .map((p) => p?.onInit?.(fetchOptions))
      .filter(Boolean);

    return new Fetch<TData, TParams>(
      serviceRef,
      options,
      update,
      Object.assign({}, ...initState)
    );
  }, []);

  fetchInstance.options = fetchOptions;
  fetchInstance.pluginImplements = plugins.map((p) =>
    p(fetchInstance, fetchOptions)
  );

  useMount(() => {
    if (manual) return;
    const params = fetchInstance.state.params || options.defaultParams || [];
    // @ts-ignore
    fetchInstance.run(...params);
  });

  useUnmount(() => {
    fetchInstance.cancel();
  });

  const {
    state: {
      loading,
      refreshing,
      complete,
      loaded,
      params = [],
      data,
      error,
      loadingMore,
    },
  } = fetchInstance;

  return {
    loadingMore,
    loading,
    refreshing,
    complete,
    loaded,
    params: params as TParams,
    data,
    error,

    cancel: useMemoizedFn(fetchInstance.cancel.bind(fetchInstance)),
    refresh: useMemoizedFn(fetchInstance.refresh.bind(fetchInstance)),
    refreshAsync: useMemoizedFn(fetchInstance.refreshAsync.bind(fetchInstance)),
    run: useMemoizedFn(fetchInstance.run.bind(fetchInstance)),
    runAsync: useMemoizedFn(fetchInstance.runAsync.bind(fetchInstance)),
    mutate: useMemoizedFn(fetchInstance.mutate.bind(fetchInstance)),
    loadMore: useMemoizedFn(fetchInstance.loadMore.bind(fetchInstance)),
    loadMoreAsync: useMemoizedFn(
      fetchInstance.loadMoreAsync.bind(fetchInstance)
    ),
  };
}
