import { Models } from '@rematch/core';
import type { Dispatch, RootState } from './store';

import { global } from './global';

export interface RootModel extends Models<RootModel> {
  global: typeof global;
}

export const models: RootModel = { global };
export type { Dispatch, RootState };
