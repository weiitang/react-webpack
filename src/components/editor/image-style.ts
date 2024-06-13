/**
 * resize插件注入的style需要注册到quill，否则编辑时会被移除
 * https://github.com/zenoamaro/react-quill/issues/330#issuecomment-402516440
 */

import { Quill } from 'react-quill';

const BaseImageFormat = Quill.import('formats/image');
const ATTRIBUTES = ['alt', 'height', 'width', 'style'];

// https://github.com/kensnyder/quill-image-resize-module/issues/10#issuecomment-317747389
export class ImageFormat extends BaseImageFormat {
  static formats(domNode: Element) {
    return ATTRIBUTES.reduce((formats, attribute) => {
      if (domNode.hasAttribute(attribute)) {
        // eslint-disable-next-line no-param-reassign
        formats[attribute] = domNode.getAttribute(attribute);
      }
      return formats;
    }, {});
  }

  format(name: string, value: any) {
    if (ATTRIBUTES.indexOf(name) > -1) {
      if (value) {
        this.domNode.setAttribute(name, value);
      } else {
        this.domNode.removeAttribute(name);
      }
    } else {
      super.format(name, value);
    }
  }
}

Quill.register(ImageFormat, true);
