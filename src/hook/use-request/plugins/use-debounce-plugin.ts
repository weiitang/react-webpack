/* eslint-disable no-param-reassign */
import type { DebounceSettings, DebouncedFunc } from 'lodash';
import { debounce } from 'lodash';
import React from 'react';
import { Plugin } from '../types';

export const useDebouncePlugin: Plugin<any, any[]> = (
  fetchInstance,
  options
) => {
  const { debounceLeading, debounceWait, debounceMaxWait, debounceTrailing } =
    options;

  const debouncedRef = React.useRef<DebouncedFunc<any>>();

  const debounceOptions = React.useMemo(() => {
    const o: DebounceSettings = {};
    if (debounceLeading !== undefined) o.leading = debounceLeading;
    if (debounceMaxWait !== undefined) o.maxWait = debounceMaxWait;
    if (debounceTrailing !== undefined) o.trailing = debounceTrailing;

    return o;
  }, [debounceLeading, debounceMaxWait, debounceTrailing]);

  React.useEffect(() => {
    if (!debounceWait) {
      debouncedRef.current?.cancel();
      return;
    }

    debouncedRef.current = debounce(
      (cb: any) => cb(),
      debounceWait,
      debounceOptions
    );

    const originRunAsync = fetchInstance.runAsync.bind(fetchInstance);

    fetchInstance.runAsync = (...args) =>
      new Promise((resolve, reject) => {
        debouncedRef.current?.(() => {
          originRunAsync(...args)
            .then(resolve)
            .catch(reject);
        });
      });

    return () => {
      debouncedRef.current?.cancel();
      fetchInstance.runAsync = originRunAsync;
    };
  }, [fetchInstance, debounceOptions, debounceWait]);

  if (!debounceWait) return {};

  return {
    onCancel() {
      debouncedRef.current?.cancel();
    },
  };
};
