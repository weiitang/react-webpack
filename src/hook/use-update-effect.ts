import React from 'react';
import type { DependencyList, EffectCallback } from 'react';
import { useEvent, useUnmount } from '.';

export function useUpdateEffect(fn: EffectCallback, deps: DependencyList) {
  const refFn = useEvent(fn);
  const isMount = React.useRef(false);

  useUnmount(() => {
    isMount.current = false;
  });

  React.useEffect(() => {
    if (!isMount.current) {
      isMount.current = true;
    } else {
      return refFn?.();
    }
  }, deps);
}
