import classnames from 'classnames';
import * as styles from './index.module.less';

export const TestPageBar = (props: any) => {
  const { children, className, style } = props;
  return (
    <div style={style} className={classnames(styles.pageBar, className)}>
      {children}
    </div>
  );
};

export const TestPageStickyBar = (props) => {
  const { children, className, style } = props;
  return (
    <div style={style} className={classnames(styles.pageStickyBar, className)}>
      {children}
    </div>
  );
};
