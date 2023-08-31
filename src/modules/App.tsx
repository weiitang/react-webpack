import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TestFn } from '@src/modules/redux-test/TestFn';
import ClassFn  from '@src/modules/redux-test/ClassFn';

import './../index.less';
// import router from './../router';

interface AppProps {
  test?: string
}

export function App(props: AppProps) {

  return <BrowserRouter>
  <Routes>
    <Route path="/" element={<TestFn />}></Route>
    <Route path="test" element={<TestFn />}></Route>
    <Route path="test1" element={<ClassFn />}></Route>
  </Routes>
  </BrowserRouter>;
}
