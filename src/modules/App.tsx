import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TestFn } from '@src/modules/redux-test/TestFn';
import ClassFn from '@src/modules/redux-test/ClassFn';
import { InputFn } from '@src/modules/input';
import Nav from './../nav/nav';
import { TdCheckBox } from '@src/modules/td/checkBox';
import { Workflow } from '@src/modules/workflow';
import Sheet from '@src/modules/sheet/sheet-demo';
import { FormTest } from '@src/modules/form';
import { HookFormTestLayout } from '@src/modules/hook-form';
import { Itest } from '@src/modules/i18n-test';

import { RootOutletNavigator } from '@src/modules/navigator/index.module';

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
          <Route path="from" element={<FormTest />}></Route>
          <Route path="hook-form" element={<HookFormTestLayout />}></Route>
          <Route path="i18n" element={<Itest />}></Route>
          {/* react-router-dom 里的path会注册到全局 仅仅是path */}
          <Route
            path="navigator-tests"
            element={<RootOutletNavigator />}
          ></Route>
        </Routes>
        {/* 实现两种路由跳转共存 */}
        {/* <RootOutletNavigator></RootOutletNavigator> */}
      </BrowserRouter>
    </>
  );
}
