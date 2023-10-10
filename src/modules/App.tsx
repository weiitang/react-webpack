import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TestFn } from '@src/modules/redux-test/TestFn';
import ClassFn from '@src/modules/redux-test/ClassFn';
import { InputFn } from '@src/modules/input';
import { TdCheckBox } from '@src/modules/td/checkBox';

import './../index.less';
// import * as styles from './../index.less';
// import router from './../router';

interface AppProps {
  test?: string;
}

export function App(props: AppProps) {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TestFn />}></Route>
        <Route path="test" element={<TestFn />}></Route>
        <Route path="test1" element={<ClassFn />}></Route>
        <Route path="input" element={<InputFn />}></Route>
        <Route path="check" element={<TdCheckBox />}></Route>
      </Routes>
    </BrowserRouter>
  );
}
