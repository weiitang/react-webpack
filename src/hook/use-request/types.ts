import type { DependencyList } from 'react';
import { Fetch } from './fetch';
import { useRequest } from './use-request';

export type DefaultData = any;

export type DefaultParams = any[];

export type InterfaceUseRequest = typeof useRequest;

export interface PluginReturn<TData, TParams extends any[]> {
  onBefore?: (params: TParams) =>
    | void
    | ({
        stopNow?: boolean;
        returnNow?: boolean;
      } & Partial<FetchState<TData, TParams>>);

  onRequest?: (
    service: Service<TData, TParams>,
    params: TParams
  ) => {
    servicePromise?: Promise<TData>;
  };

  onRefresh?: (refreshParams: RefreshParams, params: TParams) => void;
  onLoadMore?: (params: TParams) => {
    stopNow?: boolean;
    loadMoreParams?: TParams;
  };

  onResponse?: (data: TData) => Partial<FetchState<TData, TParams>>;
  onSuccess?: (data: TData, params: TParams) => void;
  onError?: (e: any, params: TParams) => void;
  onFinally?: (params: TParams, data?: TData, e?: any) => void;
  onAbort?: (params: TParams) => void;
  onCancel?: (params: TParams) => void;
  onMutate?: (data: TData) => void;
}

export interface FetchState<TData, TParams extends any[]> {
  loading: boolean;
  refreshing: boolean;
  loadingMore: boolean;
  loaded: boolean;
  complete: boolean;
  params?: TParams;
  data?: TData;
  error?: any;
}

export type Service<TData, TParams extends any[]> = (
  ...args: TParams
) => Promise<TData>;

export type Subscribe = () => void;

export interface Options<TData extends DefaultData, TParams extends any[]> {
  // 是否手动调用
  manual?: boolean;

  // 生命周期
  onBefore?: (params: TParams) => void;
  onSuccess?: (data: TData, params: TParams) => void;
  onError?: (e: any, params: TParams) => void;
  onFinally?: (params: TParams, data?: TData, e?: any) => void;
  onCancel?: (params: TParams) => void;
  onAbort?: (params: TParams) => void;

  // 默认值
  defaultParams?: TParams;
  defaultData?: TData;

  // 监听值刷新
  refreshDeps?: DependencyList;
  refreshDepsAction?: () => Promise<any> | void;

  // 延迟loading
  loadingDelay?: number;

  // 防抖 lodash
  debounceWait?: number;
  debounceMaxWait?: number;
  debounceLeading?: boolean;
  debounceTrailing?: boolean;

  // 节流 lodash
  throttleLeading?: boolean;
  throttleTrailing?: boolean;
  throttleWait?: number;

  // 缓存
  // cache 和 stale 区别，cache直接返回，stale会先用再请求
  cacheKey?: string;
  cacheTime?: number; // cache 会直接把缓存的数据返回，而不会请求
  staleTime?: number; // 如果判断不新鲜，则返回缓存数据之后会再次请求更新已有数据
  setCache?: (cacheKey: string, data: CacheData<TData, TParams>) => void;
  getCache?: (
    cacheKey: string,
    params: TParams
  ) => CacheData<TData, TParams> | void;

  // 重试配置
  retryCount?: number;
  retryInterval?: number;

  // 加载更多相关
  customComplete?: (loadingMore: boolean, data: TData) => boolean;
  customLoadMoreParams?: (params: TParams) => TParams;

  // 相同参数不请求
  blockSameParams?: boolean;
  blockSameParamsIgnore?: string[];

  // abort 相关
  customAbortParams?: (
    params: TParams,
    abortController: AbortController
  ) => TParams;
  abortBeforeRequire?: boolean;

  // 其他
  ready?: boolean;
  initializeLoading?: boolean;
}

export interface CacheData<TData = any, TParams = any> {
  data: TData;
  params: TParams;
  time: number;
}

export interface RecordData extends CacheData {
  timer?: Timeout;
}

export interface RefreshParams {
  useDefaultParams?: boolean;
}

export type Plugin<TData extends DefaultData, TParams extends any[]> = {
  (
    fetchInstance: Fetch<TData, TParams>,
    options: Options<TData, TParams>
  ): PluginReturn<TData, TParams>;
  onInit?: (
    options: Options<TData, TParams>
  ) => Partial<FetchState<TData, TParams>>;
};

export type Timeout = ReturnType<typeof setTimeout>;

export interface RequestImplementReturn<TData, TParams extends any[]>
  extends Pick<
      Fetch<TData, TParams>,
      | 'cancel'
      | 'refresh'
      | 'refreshAsync'
      | 'run'
      | 'runAsync'
      | 'mutate'
      | 'loadMore'
      | 'loadMoreAsync'
    >,
    Pick<
      FetchState<TData, TParams>,
      'loading' | 'loadingMore' | 'refreshing' | 'complete' | 'loaded'
    > {
  params: TParams;
  data: TData;
  error: any;
}
