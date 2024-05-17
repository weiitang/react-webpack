// a-hooks
import { useRequestImplement } from './use-request-implement';
import type {
  Options,
  Service,
  Plugin,
  DefaultData,
  DefaultParams,
} from './types';
import { useAutoReturnPlugin } from './plugins/use-auto-run-plugin';
import { useDebouncePlugin } from './plugins/use-debounce-plugin';
import { useRetryPlugin } from './plugins/use-retry-plugin';
import { useCachePlugin } from './plugins/use-cache';
import { useLoadMorePlugin } from './plugins/use-load-more-plugin';
import { useBlockSameParamsPlugin } from './plugins/use-block-same-params-plugin';
import { useThrottlePlugin } from './plugins/use-throttle-plugin';
import { useAbortPlugin } from './plugins/use-abort-plugin';

export function useRequest<
  TData extends DefaultData,
  TParams extends DefaultParams
>(
  service: Service<TData, TParams>,
  options: Options<TData, TParams> = {},
  plugins: Plugin<TData, TParams>[] = []
) {
  return useRequestImplement<TData, TParams>(service, options, [
    useAutoReturnPlugin,
    useDebouncePlugin,
    useRetryPlugin,
    useCachePlugin,
    useLoadMorePlugin,
    useBlockSameParamsPlugin,
    useThrottlePlugin,
    useAbortPlugin,
    ...plugins,
  ] as Plugin<TData, TParams>[]);
}

export { clearCache } from './plugins/use-cache';
