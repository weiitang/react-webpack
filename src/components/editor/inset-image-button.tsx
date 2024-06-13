/**
 * 富文本编辑器 - 上传图片
 */

import React from 'react';
import { Upload, message } from 'tdesign-react';
// import { UploadService } from '@shared/services/upload/upload.service';
// import { getProjectUrl } from '@src/utils/url';
import * as styles from './editor.less';

export function InsertImageButton(props): React.ReactElement {
  const { onUploadImage, editor, module, setLoading } = props;

  const handleUpload = async (files) => {
    setLoading(true);
    const image = files[files.length - 1];

    try {
      const response = await new Promise((res) =>
        res({
          module,
          url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5Iqlw8ORYesJJNUZcCcW-Q_rOY-9r9dEXwIUHqP8IitAkgL7xDmKH4vxx2g&s',
        })
      );
      handleInsetImage(response);
    } catch (err) {
      handleUploadImageFail(image);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadImageFail = (file) => {
    onUploadImage?.('fail', file, editor);
    message.error('图片上传失败');
  };

  // 上传成功后，插入图片标签
  const handleInsetImage = (response) => {
    onUploadImage?.('success', response, editor);

    const range = editor?.getSelection();
    const index = range ? range?.index : 0;
    editor.insertEmbed(
      index,
      'image',
      // getProjectUrl(response?.url, null, {
      //   includeDomain: false,
      // })
      response?.url
    );
  };

  return (
    <Upload
      style={{ lineHeight: 'unset' }}
      theme="custom"
      autoUpload={false}
      onSelectChange={handleUpload}
      accept="image/gif,image/jpeg,image/jpg,image/png,image/svg"
    >
      <button type="button" className={styles.button}>
        图片
      </button>
    </Upload>
  );
}
