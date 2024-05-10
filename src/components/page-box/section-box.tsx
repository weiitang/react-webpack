import React from 'react';
import classnames from 'classnames';
import * as Css from './index.less';

export function SectionBox(props) {
  const { children, full, className, style } = props;
  return (
    <div
      className={classnames(
        Css.sectionBox,
        full ? Css.sectionBoxFull : '',
        className
      )}
      style={style}
    >
      {children}
    </div>
  );
}
