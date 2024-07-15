import React from 'react';
import { Provider } from 'react-redux';

import ReactDom from 'react-dom/client';
// import ReactDOM from 'react-dom';

import { store } from '../model/store';

// react-router
import { App } from './modules/App';

// 1、单独导出Outlet
// import { OutletTest } from '@src/modules/navigator/index.module';
// 2、导出一个有Outlet上下文的histo
// import { RootOutlet } from '@src/modules/navigator/index.module';
// 3、导出加了一层Outlet的Outlet, 能访问下一层的 navigator
// import { RootOutletNavigator } from '@src/modules/navigator/index.module';
// 4、增加一个外壳导出Outlet
// import { RootOutletWarp } from '@src/modules/navigator/index.module';
// 监听history的mode
import '@src/core/router/browser';

import '@src/lib/reset.less';
import '@src/lib/reset-td.less';
import 'tdesign-react/es/style/index.css';

const root = document.createElement('div');

// root.setAttribute('id', 'app');

document.body.appendChild(root);

const app = ReactDom.createRoot(root);

app.render(
  <Provider store={store}>
    <App></App>
    {/* 本身导出Outlet报错，没有createBootstrap的history上下文 */}
    {/* <OutletTest></OutletTest> */}
    {/* 导出一个有Outlet上下文的history */}
    {/* <RootOutlet></RootOutlet> */}
    {/* RootOutletNavigator */}
    {/* <RootOutletNavigator></RootOutletNavigator> */}
    {/* 增加一个外壳的并有Outlet上下文的history导出Outlet */}
    {/* <RootOutletWarp></RootOutletWarp> */}
  </Provider>
);

// ReactDOM.render(<App/>, document.querySelector('#root'));
