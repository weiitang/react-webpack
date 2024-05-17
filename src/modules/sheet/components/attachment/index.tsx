/* eslint-disable @typescript-eslint/no-unused-vars */
import { Divider, Button } from 'tdesign-react';
import { useSelector, NAMESPACE } from '@model/index';
// import { POLICY_KEY, ATTACHMENT_MODULE } from '@shared/constants/server-hard-code';
// import { Empty } from '@src/components/empty';

import * as styles from './index.less';

type AttachmentProps = {
  [key: string]: any;
};

export const Attachment = (props: AttachmentProps) => {
  const { id } = props;
  const state = useSelector(NAMESPACE.sheet)?.[id];

  // if (loading) {
  //   return (
  //     <div className={styles.loading}>
  //       <Loading size="20px" />
  //     </div>
  //   );
  // }

  return <div className={styles.empty}>暂无数据</div>;
};
