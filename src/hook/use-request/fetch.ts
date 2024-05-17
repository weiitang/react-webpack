/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-plusplus */
import type { MutableRefObject } from 'react';
import {
  PluginReturn,
  FetchState,
  Service,
  Subscribe,
  Options,
  RefreshParams,
  DefaultData,
} from './types';

export class Fetch<TData extends DefaultData, TParams extends any[]> {
  pluginImplements: PluginReturn<TData, TParams>[] = [];

  requireId = -1;

  state: FetchState<TData, TParams> = {
    loading: false,
    refreshing: false,
    loadingMore: false,
    loaded: false,
    complete: false,
    params: undefined,
    data: undefined,
    error: undefined,
  };

  constructor(
    public serviceRef: MutableRefObject<Service<TData, TParams>>,
    public options: Options<TData, TParams>,
    public subscribe: Subscribe,
    public initState: Partial<FetchState<TData, TParams>> = {}
  ) {
    const { defaultData } = options;
    this.state = {
      ...this.state,
      data: defaultData,
      ...initState,
    };
  }

  setState(s: Partial<FetchState<TData, TParams>>) {
    this.state = {
      ...this.state,
      ...s,
    };

    Object.keys(s).length && this.subscribe();
  }

  runPluginEvent(event: keyof PluginReturn<TData, TParams>, ...args: any[]) {
    const r = this.pluginImplements
      // @ts-ignore
      .map((i) => i[event]?.(...args))
      .filter(Boolean);

    return Object.assign({}, ...r);
  }

  async runAsync(...params: TParams): Promise<TData> {
    // 纠结这里是不是要取默认的参数填充...
    const { defaultParams } = this.options;
    // eslint-disable-next-line no-param-reassign
    if (!params.length && defaultParams?.length) params = defaultParams;
    this.requireId += 1;
    const currentId = this.requireId;

    const {
      stopNow = false,
      returnNow = false,
      ...state
    } = this.runPluginEvent('onBefore', params);

    if (stopNow) {
      return new Promise(() => {});
    }

    if (returnNow) {
      this.setState({
        params,
        ...state,
      });
      return Promise.resolve(state.data);
    }

    this.setState({
      loading: true,
      params,
      ...state,
    });
    this.options.onBefore?.(params);

    try {
      let { servicePromise } = this.runPluginEvent(
        'onRequest',
        this.serviceRef,
        params
      );

      if (!servicePromise) {
        servicePromise = this.serviceRef.current(...params);
      }

      const res = await servicePromise;
      if (currentId !== this.requireId) {
        return new Promise(() => {});
      }

      const state = this.runPluginEvent('onResponse', res);

      this.setState({
        data: res,
        error: undefined,
        loading: false,
        loaded: true,
        loadingMore: false,
        ...(state ?? {}),
      });

      this.runPluginEvent('onSuccess', res, params);
      this.options.onSuccess?.(res, params);

      this.runPluginEvent('onFinally', params, res);
      this.options.onFinally?.(params, res);

      return res;
    } catch (error) {
      if (currentId !== this.requireId) {
        return new Promise(() => {});
      }

      this.setState({
        error,
        loading: false,
      });
      this.runPluginEvent('onError', error, params);
      this.options.onError?.(error, params);

      this.runPluginEvent('onFinally', params, undefined, error);
      this.options.onFinally?.(params, undefined, error);

      if (!this.options.onError) throw error;
    }
  }

  run(...params: TParams) {
    return this.runAsync(...params);
  }

  cancel() {
    this.requireId += 1;
    this.setState({
      loading: false,
      loadingMore: false,
      refreshing: false,
    });
    this.runPluginEvent('onCancel');
    this.options?.onCancel?.(this.state.params);
  }

  async refreshAsync(params: RefreshParams = { useDefaultParams: false }) {
    const { useDefaultParams } = params;
    this.setState({
      refreshing: true,
    });
    this.runPluginEvent('onRefresh', params, this.state.params);
    try {
      await this.runAsync(
        // @ts-ignore
        ...(useDefaultParams
          ? this.options.defaultParams
          : this.state.params ?? [])
      );
    } finally {
      this.setState({
        refreshing: false,
      });
    }
  }

  refresh(params: RefreshParams = {}) {
    return this.refreshAsync(params);
  }

  mutate(data?: ((oldData?: TData) => TData) | TData) {
    let targetData: TData;
    if (typeof data === 'function') {
      // @ts-ignore
      targetData = data(this.state.data);
    } else {
      targetData = data;
    }

    this.runPluginEvent('onMutate', targetData);
    this.setState({
      data: targetData,
      loaded: true,
    });
  }

  // 调用loadMore 默认TData包含分页数据
  async loadMoreAsync(): Promise<TData> {
    const {
      state: { params },
      options: { defaultParams },
    } = this;
    const { stopNow, loadMoreParams } = this.runPluginEvent(
      'onLoadMore',
      params?.length ? params : defaultParams
    );
    if (stopNow) {
      return new Promise(() => {});
    }

    this.state.loadingMore = true;
    const data = await this.runAsync(...loadMoreParams);
    return data;
  }

  loadMore() {
    return this.loadMoreAsync();
  }
}
