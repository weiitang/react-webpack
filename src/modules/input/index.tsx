/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
import React from 'react';

interface AppProps {
  test?: string
}

export function InputFn(props: AppProps) {

  const inputOnchange = (e) => {
    const file = e.target.files[0];
    // const fileBlob = new Blob(['123456'], { type: 'text/plain' });
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (e) => {

      const tkyApi = JSON.stringify({
        'apiName': 'tkyapi-createBatchTrunk',
        'centerLineId': '11111111',
        'centerInstanceId': '111111',
        // 'uploadFile': e.target?.result,
        'uploadFile': file,
        'type': 'text'
        });

        console.log('eeeeetky', tkyApi);
    };
  };

  return <div className="root">
    <input type="file" onChange={inputOnchange}/>
  </div>;
}
