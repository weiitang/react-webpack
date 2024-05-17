import { isEqual, isObject } from 'lodash';
import React from 'react';
import { Plugin } from '../types';

function deepEqual(a: object, b: object, ignoreList: string[] = []): boolean {
  let result = false;
  const keys = Object.keys(a);
  if (keys.length !== Object.keys(b).length) return false;
  for (const key of keys) {
    if (ignoreList.includes(key)) continue;
    if (isObject(a[key])) result = deepEqual(a[key], b[key], ignoreList);
    else result = isEqual(a[key], b[key]);
  }
  return result;
}

function isDeepEqualWithList(
  a: any[],
  b: any[],
  ignoreList: string[]
): boolean {
  if (a?.length !== b?.length) return false;
  if (a === b) return true;
  let result = true;
  for (let i = 0; i < a.length; i++) {
    if (!result) return result;
    const cur = a[i];
    const prev = b[i];
    if (isObject(cur) && isObject(prev))
      result = deepEqual(cur, prev, ignoreList);
    else result = isEqual(cur, prev);
  }
  return result;
}

export const useBlockSameParamsPlugin: Plugin<any, any> = (
  fetchInstance,
  options
) => {
  const { blockSameParams, blockSameParamsIgnore } = options;
  const previousParams = React.useRef<any>();

  if (!blockSameParams) return {};
  return {
    onBefore(params) {
      if (!params.length) return {};

      if (!blockSameParamsIgnore) {
        if (isEqual(params, previousParams.current))
          return {
            returnNow: true,
          };
      } else {
        if (
          isDeepEqualWithList(
            params,
            previousParams.current,
            blockSameParamsIgnore
          )
        )
          return {
            returnNow: true,
          };
      }
    },

    onSuccess(data, params) {
      previousParams.current = params;
    },
  };
};
