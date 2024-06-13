import React, { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useEventBus } from '@src/hook/use-event-bus';
// import { instance } from './../http/base';

// const root = document.querySelector('#root');
import { Dispatch, RootState } from '../../../model';

export interface AppProps {
  test?: string;
}

export function TestRedux() {
  const dispatch = useDispatch<Dispatch>();
  const state = useSelector((s: RootState) => s);

  const { trigger } = useEventBus();

  // const fn = async () => {
  //   const data = await instance.get('/v1/signs/20230724161421462', { params: { ghostlogin: '' }});

  // };

  // useEffect(() => {
  //   console.log('state', state);

  // }, [state]);

  const modelOnclick = () => {
    dispatch.global.getPendingCountReq(1);
  };

  return (
    <div className="root">
      <div
        onClick={() => {
          trigger('TestEvent', 4);
        }}
      >
        Event
      </div>
      <span onClick={modelOnclick}>点我</span>
      <span>{state.global.pendingCount}</span>
      <Link to="/test1">TO</Link>
    </div>
  );
}

export function TestEvent() {
  const [count, setCount] = useState(1);
  const eventCount = useRef(1);

  const { useListener } = useEventBus();

  const handleEvent = (paload) => {
    eventCount.current = eventCount.current + paload;
    setCount(eventCount.current);
    console.error('event', eventCount.current, paload);
  };

  useListener('TestEvent', handleEvent);

  return (
    <>
      <div className="root">
        <div>{count}</div>
      </div>

      <div className="header3">全局样式</div>
    </>
  );
}

export function TestFn() {
  return (
    <>
      <TestRedux></TestRedux>
      <TestEvent></TestEvent>
    </>
  );
}

export default TestFn;
