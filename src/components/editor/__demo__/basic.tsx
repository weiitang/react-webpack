/* eslint-disable no-console */
import * as React from 'react';
import { Editor, EditorInstanceProps } from '../index';
import './basic.less';

export default function BasicDemo() {
  const data = {
    value: `<em style="color: rgb(0, 0, 0); font-size: 14px;">约见记录</em><span style="color: rgb(0, 0, 0); font-size: 14px;">，</span><strong style="color: rgb(102, 185, 102); font-size: 14px;">富</strong><strong style="color: rgb(0, 0, 0); font-size: 14px;">文本</strong><span style="color: rgb(230, 0, 0); font-size: 14px;">约见</span><span style="color: rgb(102, 163, 224); font-size: 14px;">记录</span><span style="color: rgb(0, 0, 0); font-size: 14px;">，</span>`,
    placeholder: '请输入...',
  };
  const [value, setValue] = React.useState<string>(data.value);
  const [length, setLength] = React.useState<number>(0);
  const [text, setText] = React.useState<string>('');

  return (
    <div className="container">
      <div className="box">
        <Editor
          module={''}
          placeholder={data.placeholder}
          value={value}
          onChange={(value: string, editor: EditorInstanceProps) => {
            setValue(value);
            setLength(editor.getLength());
            setText(editor.getText());
          }}
          onParseFile={(statu) => console.log(statu, '解析文档回调')}
          onUploadImage={(statu, file) =>
            console.log(
              statu,
              file,
              '上传文件回调,这里第二个参数可以取到上传后的文件信息'
            )
          }
        />
      </div>
      <div className="box">字数: {length}</div>
      <div className="box">纯文本: {text}</div>
      <div className="box">HTML: {value}</div>
    </div>
  );
}
