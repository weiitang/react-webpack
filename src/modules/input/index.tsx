/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
import React from 'react';

import styles from './index.less';
// import './index.less';

interface AppProps {
  test?: string;
}

export function InputFn(props: AppProps) {
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

  return (
    <>
      <div className={styles.inputTest}>
        <input type="file" onChange={inputOnchange} />

        <span className="header">文件</span>
        <span className={styles.header}>文件</span>
      </div>

      <div className={styles.inputTestCss}>
        <span className={styles.header}>less</span>
      </div>

      <span className="header">global解决css-module嵌套问题</span>
    </>
  );
}
