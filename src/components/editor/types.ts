import type { UploadFile } from 'tdesign-react';
export interface EditorInstanceProps {
  /**
   * 获取去除HTML标签后的纯文字
   * @type {function(): string}
   */
  getText(): string;
  /**
   * 获取去除HTML标签后的纯文字字数
   * @type {function(): number}
   */
  getLength(): number;
  /**
   * 获取HTML字符串
   * @type {function(): string}
   */
  getHTML(): string;
}

export interface EditorProps {
  /**
   * 只读，此时用于渲染
   */
  readonly?: boolean;
  /**
   * 图片插入时后端定义的上传入口标识，必填
   * readonly false为必填，其他为必填
   */
  module?: string;
  /**
   * 富文本内容
   * @type {string}
   */
  value?: string;
  /**
   * 输入框占位文字
   * @type {string}
   */
  placeholder?: string;
  /**
   * 是否开启图片预览
   * @default false
   */
  imageViewer?: boolean;
  /**
   * 编辑器初始化后触发，可以得到编辑器Quill实例
   * @returns
   */
  onEditorInit?: (editor: EditorInstanceProps) => void;
  /**
   * 输入框onChange
   * @type {(string, EditorInstanceProps) => void}
   */
  onChange?: (value: string, editor: EditorInstanceProps) => void;
  /**
   * 是否显示解析文件的入口
   * @default false
   */
  showParseFile?: boolean;
  /**
   * 解析word文档回调
   */
  onParseFile?: (
    statu: 'success' | 'fail',
    file: UploadFile,
    editor: EditorInstanceProps
  ) => void;
  /**
   * 上传插入图片回调
   */
  onUploadImage?: (
    statu: 'success' | 'fail',
    file?: UploadFile,
    editor?: EditorInstanceProps
  ) => void;
}
