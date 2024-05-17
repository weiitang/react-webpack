import { Loading, Collapse } from 'tdesign-react';
import { useRequest } from '@src/hook';
// import { Api, ApiConfig } from '@shared/api';
import { toast } from '@src/components/td-plugin/tdesign-plugin';
import { toLocal } from '@src/utils/utc';
import { SheetModel } from '@src/modules/sheet';
import * as styles from './index.less';

type RemarkProps = {
  recordId: string;
  tableId: string;
};

const { Panel } = Collapse;

export const Remark = (props: RemarkProps) => {
  const { recordId, tableId } = props;
  const { loading, data: remarks } = useRequest(
    () => new Promise((req) => req({ recordId, tableId })),
    {
      onError: (e) => {
        toast(e?.msg, 'error');
      },
    }
  );

  const onClickLocation = (item, e) => {
    e.stopPropagation();
    const index = SheetModel.utils.getSheetIndex(item.sheetIndex);
    if (index === null) {
      toast('未找到该sheet');
      return;
    }
    const { col, row } = item;
    // 单元格选中点击单元格
    const rangeTxt = `${SheetModel.utils.chatatABC(col)}${row}`;
    SheetModel.utils.setRangeShow(rangeTxt, { sheetIndex: item.sheetIndex });
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <Loading size="20px" />
      </div>
    );
  }

  if (!remarks || (remarks as any)?.length === 0) {
    return <div className={styles.empty}>暂无数据</div>;
  }

  return (
    <div className={styles.wrap}>
      <Collapse className={styles.collapseWrap}>
        {(remarks as any)?.map((item) => (
          <Panel
            key={item.id}
            header={<span className={styles.label}>单元格的备注</span>}
            headerRightContent={
              <div
                className={styles.iconWrap}
                onClick={(e) => onClickLocation(item, e)}
              >
                <>图标</>
              </div>
            }
          >
            <div className={styles.remarkItem}>
              <div className={styles.titleWrap}>
                <div className={styles.title}>
                  {item?.creator?.name || '--'}
                </div>
                <div className={styles.time}>
                  {toLocal(item.createTime, { format: 'YYYY-MM-DD HH:mm:ss' })}
                </div>
              </div>
              <div className={styles.content}>{item.content}</div>
            </div>
          </Panel>
        ))}
      </Collapse>
    </div>
  );
};
