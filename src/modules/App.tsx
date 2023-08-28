import React, { useEffect } from 'react';
import { instance } from './../http/base';

import './../index.less';

// const root = document.querySelector('#root');

interface AppProps {
  test?: string
}

export function App(props: AppProps) {
  const fn = async () => {
    // console.log('1234', c);
    const data = await instance.get('/v1/signs/20230724161421462', { params: { ghostlogin: 'tiramisu' }});

    console.log('data', data, process.env.PROXY_AUTH);
  };

  useEffect(() => {
    fn();
  }, []);

  return <div className="root">
    <span >Hello React</span>
  </div>;
}
