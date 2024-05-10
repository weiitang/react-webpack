import React from 'react';
import classnames from 'classnames';
import * as styles from './index.less';

export function PageBox(props) {
  const { children, className, style = {} } = props;
  const classNames = classnames(styles.pageBoxWrap, className || '');

  return (
    <div className={classNames} style={style}>
      {children}
    </div>
  );
}
