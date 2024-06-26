import classNames from 'classnames';
import * as styles from './index.module.less';

export function TestPageLayout(props) {
  const { children, className, style } = props;

  return (
    <section className={classNames(styles.pageLayout, className)} style={style}>
      {children}
    </section>
  );
}
