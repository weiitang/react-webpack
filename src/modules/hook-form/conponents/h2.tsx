import classnames from 'classnames';
import * as styles from './index.module.less';

export function TestH2(props) {
  const { children, className, style } = props;

  return (
    <h2 style={style} className={classnames(styles.tppH2, className)}>
      {children}
    </h2>
  );
}
