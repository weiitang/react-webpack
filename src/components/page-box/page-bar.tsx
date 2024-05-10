import classnames from 'classnames';
import * as styles from './index.less';

export function PageBar(props) {
  const { children, className } = props;
  return (
    <div className={styles.pageBarWrap}>
      <div className={classnames(styles.pageBar, className)}>{children}</div>
    </div>
  );
}
