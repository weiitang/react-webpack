import React from 'react';
import { Provider } from 'react-redux';

import ReactDom from 'react-dom/client';
// import ReactDOM from 'react-dom';

import { store } from '../model/store';

import { App } from './modules/App';
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
  </Provider>
);

// ReactDOM.render(<App/>, document.querySelector('#root'));
