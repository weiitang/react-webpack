import { Textarea as TTextarea } from 'tdesign-react';
import type { InputTextComponent } from '@src/components/forms/types';
import { isNone } from 'ts-fns';

/**
 * 多行文本输入框
 * @param props
 * @returns
 */
export const InputText: InputTextComponent = function (props) {
  const {
    nowrap,
    placeholder,
    description,
    value,
    readOnly,
    disabled,
    onChange,
    rows = 3,
    ...attrs
  } = props;
  const handleKeyDown = (_, { e }) => {
    // 阻止换行
    if (nowrap && e.key === 'Enter') {
      e.preventDefault();
      return;
    }
  };
  const handleChange = (value) => {
    onChange(value);
  };

  const v = isNone(value) ? '' : value;
  // 移除浏览器自带的required校验
  delete attrs.required;

  return (
    <TTextarea
      {...attrs}
      rows={rows || 3}
      placeholder={[placeholder, description].filter(Boolean).join('，')}
      value={v}
      disabled={disabled || readOnly}
      onKeydown={handleKeyDown}
      onInput={handleChange} // TODO onChange会有问题， why？
    />
  );
};

InputText.mapToProps = ({ maxLen, nowrap, description }) => ({
  maxlength: maxLen,
  nowrap,
  description,
});
