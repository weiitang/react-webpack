import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
// import { instance } from './../http/base';

// const root = document.querySelector('#root');
import { Dispatch, RootState } from '../../../model';

interface AppProps {
  test?: string
}

export function TestFn(props: AppProps) {
  const dispatch = useDispatch<Dispatch>();
  const state = useSelector((s: RootState) => s);
  // const fn = async () => {
  //   const data = await instance.get('/v1/signs/20230724161421462', { params: { ghostlogin: 'tiramisu' }});

  // };

  // useEffect(() => {
  //   console.log('state', state);

  // }, [state]);

  const modelOnclick = () => {
    dispatch.global.getPendingCountReq(1);
  };

  return <div className="root">
    <span onClick={modelOnclick}>点我</span>
    <span>{state.global.pendingCount}</span>
  </div>;
}
