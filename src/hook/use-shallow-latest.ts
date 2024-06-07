import { useRef } from 'react';
import { isArray, isObject } from 'ts-fns';
import { isShallowEqual } from '@core';

/**
 * @param {*} obj
 * @returns the latest shallow equal object
 */
export function useShallowLatest(obj) {
  const used = useRef(false);
  const latest = useRef(obj);

  if (used.current && !isShallowEqual(latest.current, obj)) {
    // eslint-disable-next-line no-nested-ternary
    latest.current = isArray(obj) ? [...obj] : isObject(obj) ? { ...obj } : obj;
  }

  if (!used.current) {
    used.current = true;
  }

  return latest.current;
}
