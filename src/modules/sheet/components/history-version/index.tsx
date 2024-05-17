/* eslint-disable @typescript-eslint/no-unused-vars */
import { Timeline } from 'tdesign-react';
import { toLocal } from '@src/utils/utc';

import * as styles from './index.less';

type HistoryProps = {
  recordId: string;
  tableId: string;
};

export const HistoryVersion = (props: HistoryProps) => {
  // const { recordId, tableId } = props;
  // const { loading, data: history } = useRequest(
  //   () =>
  //     Api.request(ApiConfig.portfolioMonitor.getVersionHistory, {
  //       recordId,
  //       tableId,
  //     }),
  //   {
  //     onError: (e) => {
  //       toast(e?.msg, 'error');
  //     },
  //   }
  // );

  // if (loading) {
  //   return (
  //     <div className={styles.loading}>
  //       <Loading size="20px" />
  //     </div>
  //   );
  // }

  if (!history || history?.length === 0) {
    return (
      <div className={styles.empty}>
        <>暂无数据</>
      </div>
    );
  }

  return (
    <div className={styles.historyWrap}>
      <Timeline mode="same">
        {[]?.map((item) => (
          <Timeline.Item key={item.version}>
            <div className={styles.timelineTime}>
              {toLocal(item?.updateTime, { format: 'YYYY-MM-DD HH:mm:ss' })}
            </div>
            <div className={styles.timelineVersion}>
              {item?.version || '--'}
            </div>
            <div className={styles.timelineDetail}>
              <>提交人：</>
              {item?.createByName || '--'}
            </div>
            <div className={styles.timelineDetail}>
              说明
              {item?.remark || '--'}
            </div>
            <div className={styles.timelineDetail}>状态： --</div>
            <a className={styles.timelineLink} href="/">
              查看详情
            </a>
          </Timeline.Item>
        ))}
      </Timeline>
    </div>
  );
};
