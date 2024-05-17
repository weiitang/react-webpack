import React from 'react';
import type { DefaultData, DefaultParams, Service, Options } from './types';
import { useRequest as useRequestOrigin } from './use-request';

export function useRequest<
  TData extends DefaultData,
  TParams extends DefaultParams
>(service: Service<TData, TParams>, options: Options<TData, TParams> = {}) {
  const finalOptions: Options<TData, TParams> = React.useMemo(
    () => ({
      throttleWait: 300,
      // abortBeforeRequire: true,
      customAbortParams(params, abortController) {
        if (params?.[0]) {
          // eslint-disable-next-line no-param-reassign
          params[0].abortController = abortController;
        }
        return params;
      },
      ...options,
    }),
    [options]
  );

  return useRequestOrigin(service, finalOptions);
}
