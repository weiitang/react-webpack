import { init, RematchDispatch, RematchRootState } from '@rematch/core';
// import { models as sharedModels, SharedDispatch, SharedState } from '@shared/store/models';
import { createLogger } from 'redux-logger';
import immerPlugin from '@rematch/immer';
import { models, RootModel } from './index';

export const store = init<RootModel>({
  models: {
    ...models,
    // ...sharedModels,
  },
  redux: {
    middlewares: [
      createLogger({
        predicate: (getState, action) =>
          ![
            'loading/show',
            '@@redux/REPLACE ',
            'counter/count',
            'loading/hide',
            '@@router/LOCATION_CHANGE',
          ].includes(action.type),
        collapsed: true,
      }),
    ],
  },
  plugins: [immerPlugin()],
});

// export type Store = RematchStore<RootModel>;
export type Dispatch = RematchDispatch<RootModel>;
export type RootState = RematchRootState<RootModel>;
