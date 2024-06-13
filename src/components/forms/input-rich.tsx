import type { InputRichComponent } from '@src/components/forms/types';
import { Editor } from '@src/components/editor';

/**
 * 富文本输入框
 * @param props
 * @returns
 */
export const InputRich: InputRichComponent = function (props) {
  const { placeholder, description, ...attrs } = props;
  return (
    <Editor
      {...attrs}
      placeholder={[placeholder, description].filter(Boolean).join('，')}
    />
  );
};

InputRich.mapToProps = ({ module, description }) => ({ module, description });
