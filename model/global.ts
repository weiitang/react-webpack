import { createModel } from '@rematch/core';

import type { RootModel } from '.';

type GlobalState = {
  pendingCount: number;
  reportsCount: number;
};

export const global = createModel<RootModel>()({
  name: 'global',
  state: {
    pendingCount: 0,
    reportsCount: 0,
  } as unknown as GlobalState,
  reducers: {
    setState(state, payload: Partial<GlobalState>) {
      return {
        ...state,
        ...payload,
      };
    },
    setPendingCount(state, payload: number) {
      return {
        ...state,
        pendingCount: payload,
      };
    },
  },
  effects: (dispatch) => ({
    getPendingCountReq(p, s) {
      const data =  s.global.pendingCount + 1;
      dispatch.global.setPendingCount(data);
      // this.setPendingCount(2);
    },
  }),
});
