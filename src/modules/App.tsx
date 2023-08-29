import React from 'react';

import './../index.less';
// const root = document.querySelector('#root');
import { TestFn } from '@src/modules/redux-test/TestFn';
import ClassFn from '@src/modules/redux-test/ClassFn';

interface AppProps {
  test?: string
}

export function App(props: AppProps) {

  return <div className="root">
    <TestFn />
    <ClassFn />
  </div>;
}
