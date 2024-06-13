/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-param-reassign */
/**
 * 富文本编辑器
 *
 * react-quill: https://github.com/zenoamaro/react-quill
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import { uniqueId } from 'lodash';
import { message, Loading, Message } from 'tdesign-react';
import { getProjectUrl } from '@src/utils/url';
// import { UploadService } from 'upload.service';
import QuillResizeModule from './components/quill-resize-module/src/main';
import './image-style';
import { EditorProps, EditorInstanceProps } from './types';
import { InsertImageButton } from './inset-image-button';
import { ParseFileButton } from './parse-file-button';

import 'react-quill/dist/quill.snow.css';
import * as styles from './editor.less';
import { Previewer } from './previewer';
import { isOutLink, base64ToFile } from './utils';

// Quill注册
Quill.register('modules/resize', QuillResizeModule);

const emptyContent = '<p><br></p>';
const initFontSizeList = () => {
  const Size = Quill.import('attributors/style/size');
  Size.whitelist = [
    '10px',
    '12px',
    '14px',
    '18px',
    '24px',
    '30px',
    '36px',
    '48px',
  ];
  Quill.register(Size, true);
};

// function isMac() {
//   if (navigator.platform) {
//     return /mac/i.test(navigator.platform);
//   }

//   return /macintosh|mac os x/i.test(navigator.userAgent);
// }

const CustomToolbar = (props) => {
  // id不要写死，兼容多实例
  const { id, showParseFile } = props;

  return (
    <div id={id}>
      <select className="ql-font" defaultValue="microsoft yahei">
        <option value="microsoft yahei">{'微软雅黑'}</option>
        <option value="serif"></option>
        <option value="monospace"></option>
      </select>
      <select className="ql-size" defaultValue="14px">
        <option value="10px">10</option>
        <option value="12px">12</option>
        <option value="14px">14</option>
        <option value="18px">18</option>
        <option value="24px">24</option>
        <option value="30px">30</option>
        <option value="36px">36</option>
        <option value="48px">48</option>
      </select>
      <button className="ql-bold"></button>
      <button className="ql-italic"></button>
      <button className="ql-underline"></button>
      <select className="ql-color"></select>
      <select className="ql-background"></select>
      <button className="ql-list" value="ordered"></button>
      <button className="ql-list" value="bullet"></button>
      <select className="ql-align"></select>
      <div className="btn-ql">
        <InsertImageButton {...props} />
      </div>
      {showParseFile ? (
        <div className="btn-ql">
          <ParseFileButton {...props} />
        </div>
      ) : null}
    </div>
  );
};

export function Editor(props: EditorProps): React.ReactElement {
  const { onChange, value, onEditorInit, readonly, imageViewer, module } =
    props;
  const [contentHTML, setContentHTML] = useState(null);
  const [editorInstance, setEditorInstance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [render, setRender] = useState(false);
  let reactQuillRef = null;
  const idRef = useRef(`toolbar_${uniqueId()}`);
  const instanceRef = useRef(null);
  const isFocusRef = useRef(false);
  const [showTips, setShowTips] = useState(false);

  const handleInsetImage = (response) => {
    const range = instanceRef.current?.getSelection();
    const index = range ? range?.index : 0;
    instanceRef.current.insertEmbed(
      index,
      'image',
      getProjectUrl(response?.url, null, {
        includeDomain: false,
      })
    );
    setTimeout(() => {
      instanceRef.current.focus();
    }, 0);
  };

  const handleUploadImage = async (image) => {
    setLoading(true);
    try {
      // const response = await UploadService.uploadFile(image, module);
      const response = {};
      handleInsetImage(response);
    } catch (err) {
      console.error(err);
      message.error('图片上传失败');
    } finally {
      setLoading(false);
    }
  };

  const imageCopyFilter = useCallback((node, delta) => {
    if (isFocusRef.current) {
      if (isOutLink(node.src)) {
        setShowTips(true);
        delta.ops = [];
      }
      if (node.src.startsWith('data:image')) {
        const file = base64ToFile(node.src);
        handleUploadImage(file);
        delta.ops = [];
      }
    }

    return delta;
  }, []);

  const modules = {
    toolbar: `#${idRef.current}`,
    resize: {
      locale: {},
    },
    clipboard: {
      matchers: [['IMG', imageCopyFilter]],
    },
  };

  useEffect(() => {
    initFontSizeList();
    setRender(true);

    if (editorInstance) {
      onEditorInit?.(editorInstance);
      instanceRef.current?.on('selection-change', (range) => {
        if (range && range.length === 0) {
          isFocusRef.current = true;
        }
      });
    }
  }, [editorInstance]);

  useEffect(() => {
    setContentHTML(value);
  }, [value]);

  const handleChange = (content: string, editor: EditorInstanceProps) => {
    let contentFilter = content;
    if (content === emptyContent) {
      contentFilter = null;
    }
    setContentHTML(contentFilter);
    onChange?.(contentFilter, editor);
  };

  if (readonly) {
    return <Previewer content={contentHTML} imageViewer={imageViewer} />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <CustomToolbar
          {...props}
          id={idRef.current}
          editor={editorInstance}
          setLoading={setLoading}
        />
      </div>
      {render ? (
        <ReactQuill
          className={styles.quill}
          ref={(el) => {
            reactQuillRef = el;
            setEditorInstance(reactQuillRef?.getEditor());
            instanceRef.current = reactQuillRef?.getEditor();
          }}
          theme="snow"
          modules={modules}
          {...props}
          readOnly={loading}
          value={contentHTML}
          onChange={(content, delta, source, editor) =>
            handleChange(content, editor)
          }
        />
      ) : null}
      {loading ? (
        <div className={styles.mask}>
          <Loading size="small"></Loading>
        </div>
      ) : null}
      {showTips ? (
        <Message
          duration={3000}
          theme="warning"
          className={styles.messageTip}
          onDurationEnd={() => setShowTips(false)}
          closeBtn={true}
          onCloseBtnClick={() => setShowTips(false)}
        >
          {
            '图片粘贴失败。此图片为外部链接，可能会因外部原因图片无法正常显示。请保存到本地上传或通过截图粘贴到文本框上传。'
          }
        </Message>
      ) : null}
    </div>
  );
}
