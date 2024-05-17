import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TestFn } from '@src/modules/redux-test/TestFn';
import ClassFn from '@src/modules/redux-test/ClassFn';
import { InputFn } from '@src/modules/input';
import Nav from './../nav/nav';
import { TdCheckBox } from '@src/modules/td/checkBox';
import { Workflow } from '@src/modules/workflow';
import Sheet from '@src/modules/sheet/sheet-demo';

import './../index.less';
// import * as styles from './../index.less';
// import router from './../router';

export interface AppProps {
  test?: string;
}

export function App() {
  return (
    <>
      <BrowserRouter>
        <Nav></Nav>
        <Routes>
          <Route path="/" element={<TestFn />}></Route>
          <Route path="test" element={<TestFn />}></Route>
          <Route path="test1" element={<ClassFn />}></Route>
          <Route path="input" element={<InputFn />}></Route>
          <Route path="check" element={<TdCheckBox />}></Route>
          <Route path="workflow" element={<Workflow />}></Route>
          <Route path="sheet" element={<Sheet />}></Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}
