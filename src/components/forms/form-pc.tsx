import { Form as TForm } from 'tdesign-react';
import { FormCommon } from '@src/components/forms';
import { ClipBoardService } from '@src/lib/clipboard.service';
import { toast } from '@src/components/td-plugin/tdesign-plugin';

const isDebug = () => true;

export class Form extends FormCommon {
  Implement(props) {
    const { labelAlign, children, onSubmit, ...attrs } = props;
    const handleSubmit = async ({ e }) => {
      e.preventDefault();
      await onSubmit?.();
    };
    return (
      <TForm labelAlign={labelAlign} {...attrs} onSubmit={handleSubmit}>
        {children}
      </TForm>
    );
  }

  /**
   * 开发测试环境支持通过ctrl+shift+C来实现表单数据拷贝，用于复现问题
   * 发现问题后，立即执行 ctrl+shift+C，然后在企业微信中通过 ctrl+v 来黏贴表单数据给对应的开发人员进行复原调试
   */

  onAffect() {
    if (isDebug()) {
      // @ts-ignore
      this.model = this.props.model;
    }
  }

  onMounted() {
    // @ts-ignore
    if (isDebug() && this.props.model && !window.__getFormModel) {
      const clipboard = (ClipBoardService as any).instance();
      // @ts-ignore
      clipboard.form = this;
      // @ts-ignore
      this.handleClipCopy = (e) => {
        // @ts-ignore
        const { model } = this;
        if (!model) {
          return;
        }

        if (!e.ctrlKey || !e.shiftKey) {
          return;
        }

        const recordToClipboard = () => {
          const formData = model.Chunk().toJSON();
          console.debug(formData);
          const text = JSON.stringify(formData, null, 4);
          clipboard.write(text);
        };
        const exportToClipboard = () => {
          const formData = model.Chunk().toData();
          console.debug(formData);
          const text = JSON.stringify(formData, null, 4);
          clipboard.write(text);
        };

        if (e.code === 'KeyM') {
          console.debug(model);
        } else if (e.code === 'KeyD') {
          exportToClipboard();
          toast('表单提交数据已复制，可在其他地方粘贴后查看');
        } else if (e.code === 'KeyX') {
          recordToClipboard();
          model.fromJSON({});
          toast(
            '表单数据已剪切，可在其他地方粘贴，可在当前页面可通过 Ctrl+Shift+V 来恢复表单数据'
          );
        } else if (e.code === 'KeyV') {
          clipboard.read().then((text) => {
            const data = JSON.parse(text);
            model.Chunk().fromJSON(data);
            toast('表单数据已被覆盖');
          });
        } else if (e.code === 'KeyC') {
          recordToClipboard();
          toast(
            '表单数据已复制，可在其他地方粘贴，可在当前页面通过 Ctrl+Shift+V 来恢复表单数据'
          );
        }
      };
      // @ts-ignore
      window.addEventListener('keypress', this.handleClipCopy);
    }
  }

  onUnmount() {
    if (isDebug()) {
      // @ts-ignore
      if (this.handleClipCopy) {
        // @ts-ignore
        window.removeEventListener('keypress', this.handleClipCopy);
      }
    }
  }
}
