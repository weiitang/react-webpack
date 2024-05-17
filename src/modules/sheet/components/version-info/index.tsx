import { Divider, Loading } from 'tdesign-react';
import { useRequest } from '@src/hook';
// import { Api, ApiConfig } from '@shared/api';
import { toast } from '@src/components/td-plugin/tdesign-plugin';
import { toLocal } from '@src/utils/utc';
import { useSelector, NAMESPACE } from '@model/index';
import { ListItem } from '../common/list-item';
import * as styles from './index.less';

type VersionInfoProps = {
  recordId: string;
  tableId: string;
};

export const VersionInfo = (props: VersionInfoProps) => {
  const { recordId } = props;
  const state = useSelector(NAMESPACE.sheet)?.[recordId];

  const { loading, data } = useRequest<any, any>(
    () =>
      new Promise((req) => {
        setTimeout(() => {
          req({});
        }, 1000);
      }),
    {
      onError: (e) => {
        toast(e?.msg, 'error');
      },
    }
  );

  if (loading) {
    return (
      <div className={styles.loading}>
        <Loading size="20px" />
      </div>
    );
  }

  return (
    <div className={styles.versionWrap}>
      <ListItem label="当前状态" value={state?.record?.fillingStatus?.name} />
      <ListItem label="数据表现" value={state?.record?.dataPerformance?.name} />

      <Divider className={styles.divider} />
      <ListItem
        label="个人保存版本"
        value={
          <div className={styles.linkWrap}>
            <p>{data?.local?.version || '--'}</p>
            {data?.local?.version && data?.local?.id ? <>查看</> : null}
          </div>
        }
      />
      <ListItem label="最近保存用户" value={data?.local?.createByName} />
      <ListItem
        label="最近保存时间"
        value={toLocal(data?.local?.updateTime, {
          format: 'YYYY-MM-DD HH:mm:ss',
        })}
      />

      <Divider className={styles.divider} />
      <ListItem
        label="共享最新版本"
        value={
          <div className={styles.linkWrap}>
            <p>{data?.share?.version || '--'}</p>
            {data?.share?.version && data?.share?.id ? <>查看</> : null}
          </div>
        }
      />
      <ListItem label="共享版本提交人" value={data?.share?.createByName} />
      <ListItem
        label="共享版本更新"
        value={toLocal(data?.share?.updateTime, {
          format: 'YYYY-MM-DD HH:mm:ss',
        })}
      />
      <ListItem label="说明" value={data?.share?.remark} />

      <Divider className={styles.divider} />
      <ListItem label="投后DL" value="12324" />
      <ListItem label="补充跟进人" value="1234" />
      <ListItem label="运营数据填写人" value="1234" />
      <ListItem label="运营数据审核人" value="1122" />
    </div>
  );
};
