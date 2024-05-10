import React, { ReactNode } from 'react';
import classnames from 'classnames';
import * as styles from './index.less';

interface PageContentProps {
  /**
   * 内部SectionBox的排列方向，x表示横向排列，y表示纵向排列
   */
  direction?: 'x' | 'y';
  children: ReactNode;
  className?: string;
  wrapClassName?: string;
  style?: React.CSSProperties;
}

export function PageContent(props: PageContentProps) {
  const { children, className, wrapClassName, style } = props;
  const classNames = classnames(
    styles.pageContent,
    {
      [styles.spaceX]: props.direction === 'x',
      [styles.spaceY]: props.direction === 'y',
    },
    className || ''
  );

  const wrapClassNames = classnames(
    styles.pageContentWrap,
    wrapClassName || ''
  );

  return (
    <div className={wrapClassNames}>
      <div className={classNames} id="PageContent" style={style}>
        {children}
      </div>
    </div>
  );
}
