import { useMemoizedFn } from '@src/hook';
import type { Plugin, CacheData, RecordData, Timeout } from '../types';

const cacheMap = new Map<string, RecordData>();

const defaultSetCache = (
  cacheKey: string,
  cacheTime: number,
  data: CacheData
) => {
  const cachedData = cacheMap.get(cacheKey);
  if (cachedData?.timer) clearTimeout(cachedData?.timer);
  let timer: Timeout | undefined;
  if (cacheTime !== -1) {
    timer = setTimeout(() => {
      cacheMap.delete(cacheKey);
    }, cacheTime);
  }

  cacheMap.set(cacheKey, {
    ...data,
    timer,
  });
};

const defaultGetCache = (cacheKey: string): CacheData => cacheMap.get(cacheKey);

export const clearCache = (cacheKey?: string) => {
  if (cacheKey) cacheMap.delete(cacheKey);
  else cacheMap.clear();
};

export const useCachePlugin: Plugin<any, any[]> = (fetchInstance, options) => {
  const {
    cacheKey,
    cacheTime = 5 * 60 * 1000,
    staleTime = 0,
    setCache: customSetCache,
    getCache: customGetCache,
  } = options;

  const getCache = useMemoizedFn((params) => {
    if (customGetCache) {
      return customGetCache(cacheKey, params);
    }
    return defaultGetCache(cacheKey);
  });

  const setCache = useMemoizedFn((key: string, cacheData: CacheData) => {
    if (customSetCache) customSetCache(key, cacheData);
    else defaultSetCache(key, cacheTime, cacheData);
  });

  const isStale = (cacheData: CacheData) =>
    staleTime === -1 || new Date().getTime() - cacheData.time <= staleTime;

  if (!cacheKey) return {};

  return {
    onBefore(params) {
      const cacheData = getCache(params);
      if (!cacheData || !Object.hasOwnProperty.call(cacheData, 'data')) {
        return {};
      }

      // if data is fresh, stop request
      if (isStale(cacheData)) {
        return {
          loading: false,
          loaded: true,
          data: cacheData.data,
          returnNow: true,
        };
      }
      return {
        data: cacheData.data,
      };
    },

    onSuccess(data, params) {
      setCache(cacheKey, {
        data,
        params,
        time: new Date().getTime(),
      });
    },

    onMutate(data) {
      setCache(cacheKey, {
        data,
        params: fetchInstance.state.params,
        time: new Date().getTime(),
      });
    },
  };
};
