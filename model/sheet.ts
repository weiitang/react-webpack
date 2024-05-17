/* eslint-disable @typescript-eslint/no-unused-vars */
import { createModel } from '@rematch/core';
import { omit } from 'lodash';
import type { RootModel } from '.';
import { sheetData } from '@src/modules/sheet/config';

type StateType = {
  [key: string]: any;
};

export const sheet = createModel<RootModel>()({
  name: 'sheet',
  state: {} as unknown as StateType,
  reducers: {
    updateDetail(state, namespace, payload: Partial<StateType>) {
      return {
        ...state,
        [namespace]: payload,
      };
    },
  },
  effects: (dispatch) => ({
    async getSheetDetail(recordId: string) {
      // const res = await Api.request(ApiConfig.sheet.getSheetDetail, { id: recordId });
      const res = await new Promise((req) => {
        setTimeout(() => {
          req(sheetData);
        }, 1000);
      });
      this.updateDetail(recordId, omit(res as StateType, 'sheets'));
      return res;
    },
  }),
});
