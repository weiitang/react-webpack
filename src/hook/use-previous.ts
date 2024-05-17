import React from 'react';

export type ShouldUpdateFunc<T> = (prev: T | undefined, next: T) => boolean;

function defaultShouldUpdate<T>(prev?: T, next?: T) {
  return !Object.is(prev, next);
}

export function usePrevious<T>(
  value: T,
  shouldUpdate: ShouldUpdateFunc<T> = defaultShouldUpdate,
  previousValue?: T
): T {
  const prev = React.useRef<T>(previousValue);
  const curr = React.useRef<T>();
  if (shouldUpdate(prev.current, value)) {
    prev.current = curr.current;
    curr.current = value;
  }

  return prev.current;
}
