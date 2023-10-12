// a-hooks

import React from 'react';
import type { DependencyList } from 'react';

export function depsAreSame(newDeps: DependencyList, oldDeps: DependencyList) {
  if (newDeps === oldDeps) return true;
  if (newDeps.length !== oldDeps.length) return false;
  for (let i = 0; i < newDeps.length; i++) {
    if (!Object.is(newDeps[i], oldDeps[i])) return false;
  }
  return true;
}

export function useCreation<T = any>(factor: () => T, deps: DependencyList): T {
  const ref = React.useRef({
    data: undefined as T,
    deps,
    initialized: false,
  });

  if (!ref.current.initialized || !depsAreSame(deps, ref.current.deps)) {
    ref.current = {
      data: factor(),
      deps,
      initialized: true,
    };
  }

  return ref.current.data;
}
