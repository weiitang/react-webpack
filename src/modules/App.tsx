import React from 'react';

import './../index.less';

// const root = document.querySelector('#root');

interface AppProps {
  test?: string
}

export function App(props: AppProps) {
  const fn = () => {
  };

  fn();

    fn();

  return <div className="root">
    <span >Hello React</span>
  </div>;
}
