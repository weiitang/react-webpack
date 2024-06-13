/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
import React from 'react';
import { useEventBus } from '@src/hook/use-event-bus';

import * as styles from './index.less';
import './index.less';

interface AppProps {
  test?: string;
}

export function InputFn(props: AppProps) {
  const { trigger, useListener } = useEventBus();

  const inputOnchange = (e) => {
    const file = e.target.files[0];
    // const fileBlob = new Blob(['123456'], { type: 'text/plain' });
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (e) => {
      const tkyApi = JSON.stringify({
        apiName: 'tkyapi-createBatchTrunk',
        centerLineId: '11111111',
        centerInstanceId: '111111',
        // 'uploadFile': e.target?.result,
        uploadFile: file,
        type: 'text',
      });

      console.log('eeeeetky', tkyApi, e);
    };
  };

  const handleClickEvent = () => {
    console.log('TestEvent');
    trigger('TestEvent', 3);
  };

  // const handleEvent = (count) => {
  //   console.log('event', count);
  // };

  // useListener('TestEvent', handleEvent);

  return (
    <>
      {/* <div className={styles.inputTest}>
        <input type="file" onChange={inputOnchange} />

        <span className="header">文件</span>
        <span className={styles.header}>文件</span>
      </div>

      <div className={styles.inputTestCss}>
        <span className={styles.header}>less</span>
      </div> */}

      <span className="header">global解决css-module嵌套问题</span>
      <span className="header2">global解决css-module嵌套问题</span>
      <span className="header1">global解决css-module嵌套问题12</span>
      <span className="header3">global解决css-module嵌套问题12456</span>
      <span className={styles.header}>global解决css-module嵌套问题123</span>
      <span className={styles.header1}>global解决css-module嵌套问题1234</span>
      <span className="globalTest">全局上的css</span>
      <div onClick={handleClickEvent}>Event</div>
    </>
  );
}
