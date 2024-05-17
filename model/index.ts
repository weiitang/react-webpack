import { Models } from '@rematch/core';
import type { Dispatch, RootState } from './store';
import {
  useSelector as useReduxSelector,
  useDispatch as useReduxDispath,
} from 'react-redux';

import { global } from './global';
import { sheet } from './sheet';

export enum NAMESPACE {
  global = 'global',
  sheet = 'sheet',
}

export interface RootModel extends Models<RootModel> {
  global: typeof global;
  sheet: typeof sheet;
}

export function useSelector(name: string) {
  const state = useReduxSelector<RootState, any>(
    (state: RootState) => state[name]
  );
  return state;
}

export function useDispatch(name: string) {
  const dispatch = useReduxDispath<Dispatch>();
  return dispatch[name];
}

export const models: RootModel = { global, sheet };
export type { Dispatch, RootState };
