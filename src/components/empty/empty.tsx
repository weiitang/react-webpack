import * as React from 'react';
import classnames from 'classnames';

import * as styles from './empty.less';
import EmptyImage from './icons/icon-empty.png';
import { EmptyProps } from './index';

// 在React18中FC去掉了对于children的隐形声明
export const Empty: React.FC<EmptyProps> = (props) => {
  const { className, tips, children, imgUrl = EmptyImage } = props;

  const emptyBoxClass = classnames([styles.empty, className]);
  const tipsClass = classnames(styles.tips);

  return (
    <div className={emptyBoxClass}>
      <div className={styles.wapper}>
        {imgUrl ? <img src={imgUrl} /> : null}
        <div className={tipsClass}>{tips || '暂无数据'}</div>
        {children ? <div>{children}</div> : null}
      </div>
    </div>
  );
};

export default Empty;
