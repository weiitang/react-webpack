import { lazy } from 'react';

const TestFn = lazy(() => import('@src/modules/redux-test/TestFn'));


const ROUTER = [
  {
    path: '/',
    component: TestFn,
    exact: true
  }
];

export default ROUTER;
