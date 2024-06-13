/**
 * 富文本编辑器 - 解析word文档
 */
import React, { useState } from 'react';
import { Popconfirm, Button, Upload, message } from 'tdesign-react';
import { round } from 'lodash';
import * as mammoth from 'mammoth';
// import { EventName } from '@src/lib/aegis/type';
// import { reportEvent } from '../../libs/monitor/aegis';
import * as styles from './editor.less';

// 提取word文本
const getTextContentFromWord = (buffer) =>
  mammoth.convertToHtml({ arrayBuffer: buffer }).then((result) => {
    const contentBlocks = result?.value;
    return Promise.resolve(contentBlocks);
  });

export function ParseFileButton(props): React.ReactElement {
  const { onParseFile, editor } = props;
  const [visible, setVisible] = useState(false);

  // 将文档解析至编辑器
  const handleParseFile = (file) => {
    const fileSize = round(file.size / 1024, 2);
    if (fileSize > 1024 * 5) {
      message.error('文件太大，文档不能大于');
      setVisible(false);
      return;
    }
    getTextContentFromWord(file.raw)
      .then((content) => {
        const range = editor?.getSelection();
        const index = range ? range.index : 0;
        editor.pasteHTML(index, content);
        onParseFile?.('success', file, editor);
      })
      .catch((err) => {
        console.error('富文本word解析错误：', err);
        message.error('解析出错，建议复制文档内容粘贴到文本框');
        onParseFile?.('fail', file, editor);
      })
      .finally(() => {
        setVisible(false);
        // word解析功能埋点统计
        // reportEvent({
        //   name: EventName.EDITOR_PARSEWORDFILE,
        //   remark: '富文本编辑器word文档解析功能',
        // });
      });
    return false;
  };

  return (
    <Popconfirm
      visible={visible}
      popupProps={{ overlayClassName: 'editor-parse-popup' }}
      content={'Word格式复杂，可能无法保证完全一致'}
      confirmBtn={
        <Upload
          theme="custom"
          beforeUpload={handleParseFile}
          accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        >
          <Button className="file-parse-btn" theme={'primary'} size={'small'}>
            {'导入'}
          </Button>
        </Upload>
      }
      cancelBtn={
        <Button
          theme={'default'}
          size={'small'}
          variant={'outline'}
          onClick={() => {
            setVisible(false);
          }}
        >
          {'取消'}
        </Button>
      }
    >
      <button
        className={styles.button}
        type="button"
        onClick={() => {
          setVisible(true);
        }}
      >
        文件
      </button>
    </Popconfirm>
  );
}
