import { Form, Popup } from 'tdesign-react';
import classnames from 'classnames';
import { FormItemCommon, useFormItemContext } from '@src/components/forms';
import { Children, cloneElement } from 'react';
import { decideby } from 'ts-fns';
import * as Css from './form-item.less';

const { FormItem: TFormItem } = Form;

export function FormItemLayout(props) {
  const {
    errorMessage,
    required,
    label,
    labelAlign,
    action,
    actionAlign,
    help,
    tips,
    children,
    ignoreLabel = false,
    ignoreMessage = false,
    className,
    validatorSuccussMessage,
    ...attrs
  } = props;

  const { view } = useFormItemContext();
  const messageContent = decideby(() => {
    if (ignoreMessage) return null;
    if (errorMessage) {
      return (
        <div className={Css.formHelp}>
          <span className={[Css.formItemError, 'form-item-error'].join(' ')}>
            {errorMessage}
          </span>
          <>{help && typeof help === 'function' ? help(view) : help}</>
        </div>
      );
    }

    if (!help && !(attrs?.value && !errorMessage && validatorSuccussMessage)) {
      return null;
    }
    return (
      <div className={Css.formHelp}>
        {attrs?.value && !errorMessage && validatorSuccussMessage ? (
          <span className={Css.formItemSuccuss}>{validatorSuccussMessage}</span>
        ) : null}
        <>{help && typeof help === 'function' ? help(view) : help}</>
      </div>
    );
  });
  const tipsContent = decideby(() => {
    if (tips) {
      const content = typeof tips === 'function' ? tips(view) : tips;
      return (
        <Popup
          trigger="hover"
          showArrow
          content={<div className={Css.tipsContent}>{content}</div>}
        >
          <span className={Css.tipsIcon}>?</span>
        </Popup>
      );
    }
    return null;
  });

  const infoContent = typeof action === 'function' ? action(view) : action;

  const labelText = typeof label === 'function' ? label(view) : label;
  const labelContent = ignoreLabel
    ? null
    : decideby(() => {
        if (action && labelAlign === 'top' && actionAlign !== 'right') {
          return (
            <span
              className={classnames(
                Css.formItemLabel,
                required ? 't-form__label--required' : ''
              )}
            >
              <label>
                <span>{labelText}</span>
                <span>{tipsContent}</span>
              </label>
              <span className={Css.formItemLabelInfo}>{infoContent}</span>
            </span>
          );
        }
        return (
          <span className={required ? 't-form__label--required' : ''}>
            <label>
              <span>{labelText}</span>
              <span>{tipsContent}</span>
            </label>
          </span>
        );
      });

  return (
    <div className={classnames([Css.formItem, className])}>
      {/* requiredMark 固定为false，避免受tdesign影响 */}
      <TFormItem
        {...attrs}
        labelAlign={labelAlign}
        label={labelContent}
        help={messageContent}
        requiredMark={false}
      >
        {/* div用于从tdesign的表单组件控制中脱离出来 */}
        <div className={Css.formItemBox}>{children}</div>
        {action && actionAlign === 'right' ? (
          <div className={Css.actionRight}>{infoContent}</div>
        ) : null}
      </TFormItem>
      {action && labelAlign !== 'top' ? (
        <span className={Css.formItemInfo}>{infoContent}</span>
      ) : null}
    </div>
  );
}

export class FormItem extends FormItemCommon {
  Implement(props) {
    const { children, ...attrs } = props;
    return (
      <FormItemLayout {...attrs}>
        {Children.map(children, (child) =>
          // 让输入框边框变色
          cloneElement(child, {
            status: attrs.errorMessage ? 'error' : '',
          })
        )}
      </FormItemLayout>
    );
  }
}
