import classNames from 'classnames';
import * as styles from './index.less';
import { FORM_ITEM_ERROR_CLASS } from './index';

export interface FormItemLayoutProps {
  icon?: React.ReactNode | boolean;
  labelAlign?: 'top' | 'left' | 'right';
  label?: string;
  tips?: React.ReactNode | boolean;
  requiredMark?: boolean;
  status?: 'error' | 'warning' | 'success';
  children?: React.ReactNode;
}

export function HookFormItemLayout(props: FormItemLayoutProps) {
  const { labelAlign, label, tips, status, icon, requiredMark, children } =
    props;

  return (
    <div
      className={classNames(styles.formItem, {
        [styles.labelAlignTop]: labelAlign === 'top',
        [styles.labelAlignLeft]: labelAlign === 'left',
        [styles.labelAlignRight]: labelAlign === 'right',
        [FORM_ITEM_ERROR_CLASS]: status === 'error',
      })}
    >
      {label && (
        <div
          className={classNames(styles.label, {
            [styles.labelRequired]: requiredMark,
          })}
        >
          {label}
        </div>
      )}
      <div className={styles.controls}>
        <div className={styles.content}>
          {children}
          <span
            className={classNames(styles.icon, {
              [styles.iconError]: status === 'error',
              [styles.iconWarning]: status === 'warning',
              [styles.iconSuccess]: status === 'success',
            })}
          >
            {icon}
          </span>
        </div>
        {tips && (
          <div
            className={classNames(styles.tips, {
              [styles.tipsError]: status === 'error',
              [styles.tipsWarning]: status === 'warning',
              [styles.tipsSuccess]: status === 'success',
            })}
          >
            {tips}
          </div>
        )}
      </div>
    </div>
  );
}
