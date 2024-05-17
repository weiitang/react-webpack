import { LuckSheet, SheetModel } from '@src/modules/sheet';
import { Loading, Tabs } from 'tdesign-react';
import { ReactNode, useState, useMemo, useEffect } from 'react';
import { toast } from '@src/components/td-plugin/tdesign-plugin';
import classNames from 'classnames';
import dayjs from 'dayjs';
import LuckyExcel from '../../luckysheet-excel/luckyexcel.esm';
import { useSelector, NAMESPACE } from '@model/index';
import { useSize } from '@src/hook';
import { importExcelDialog } from './../excel-dialog';
import { HistoryVersion } from './../history-version';
import { VersionInfo } from './../version-info';
import { Attachment } from './../attachment';
import { Remark } from './../remark';
import * as styles from './index.less';

const { TabPanel } = Tabs;

export enum ToolKey {
  version = 'version',
  history = 'history',
  import = 'import',
  export = 'export',
  attachments = 'attachments',
  remark = 'remark',
  editArea = 'editArea',
  displayArea = 'displayArea',
}

type SheetProps = {
  data?: any[];
  config?: any;
  readonly?: boolean; // 表格是否只读（按钮不能操作）
  disabledKeys?: ToolKey[]; // 菜单哪些不能点
  whiteListKeys?: ToolKey[]; // 白名单key 不受权限控制
  otherToolList?: ToolListProps[];
  sheetModel: SheetModel;
  loading?: boolean;
  recordId: string;
};

type ToolListProps = {
  icon: ReactNode;
  label: string;
  key: ToolKey;
  component?: ReactNode;
  onClick?: () => void;
};

const ToolItem = (
  props: Pick<ToolListProps, 'icon' | 'onClick' | 'label'> & {
    disabled?: boolean;
  }
) => {
  const { icon, label, onClick, disabled } = props;
  return (
    <div
      className={classNames(styles.tool, disabled ? styles.toolDisabled : {})}
      onClick={onClick}
    >
      {icon}
      <p>{label}</p>
    </div>
  );
};

export const Sheet = (props: SheetProps) => {
  const {
    loading,
    sheetModel,
    readonly,
    recordId,
    disabledKeys,
    otherToolList = [],
    whiteListKeys = [],
  } = props;
  const state = useSelector(NAMESPACE.sheet)?.[recordId];
  const [currentTab, setCurrentTab] = useState(null);
  const [tabs, setTabs] = useState([]);
  const { height } = useSize();

  const toolList = useMemo<ToolListProps[]>(() => {
    // const policies = state?.record?.policies || {};
    const result = [
      {
        icon: <></>,
        label: '版本信息',
        key: ToolKey.version,
        component: (
          <VersionInfo
            recordId={recordId}
            tableId={state?.latestVersion?.tableId}
          />
        ),
        policy: true,
      },
      {
        icon: <></>,
        label: '历史版本',
        key: ToolKey.history,
        component: (
          <HistoryVersion
            recordId={recordId}
            tableId={state?.latestVersion?.tableId}
          />
        ),
        policy: true,
      },
      {
        icon: <></>,
        label: '导入excel',
        key: ToolKey.import,
        policy: true,
        onClick() {
          importExcelDialog(
            { companyName: state?.company?.name },
            (_data, isCover) => {
              const newData = _data;
              if (isCover && _data.length) {
                newData[0].name = state?.company?.name;
              }
              sheetModel.importExcel(newData, isCover);
            }
          );
        },
      },
      {
        icon: <></>,
        label: '导出excel',
        key: ToolKey.export,
        policy: true,
        onClick() {
          const allSheetData = luckysheet.toJson();
          // 文件名修改为特定格式
          allSheetData.title = `${state?.company?.name || ''}${
            state?.latestVersion?.version
          }_${dayjs().format('YYYYMMDDHHmmss')}`;
          LuckyExcel.transformLuckyToExceljs(
            allSheetData,
            () => {
              toast('已导出', 'success');
            },
            (err) => {
              toast(err, 'error');
            }
          );
        },
      },
      {
        icon: <></>,
        label: '附件',
        key: ToolKey.attachments,
        component: <Attachment id={recordId} />,
        policy: true,
      },
      {
        icon: <></>,
        label: '备注',
        key: ToolKey.remark,
        component: (
          <Remark recordId={recordId} tableId={state?.latestVersion?.tableId} />
        ),
        policy: true,
      },
      {
        icon: <></>,
        label: '限定编辑区域',
        key: ToolKey.editArea,
        policy: true,
        onClick() {
          sheetModel.setRange();
        },
      },
    ]?.filter((item) => item.policy);
    return result;
  }, [sheetModel, state]);

  useEffect(() => {
    if (loading) {
      return;
    }
    setTimeout(() => {
      luckysheet.resize();
    }, 0);
  }, [height, loading]);

  return (
    <Loading loading={loading} showOverlay>
      <div className={styles.containerWrap}>
        <div className={styles.sheetWrap}>
          <div className={styles.toolWrap}>
            {[...(toolList || []), ...(otherToolList || [])]?.map((tool) => (
              <ToolItem
                // 白名单不受控制
                disabled={
                  (readonly || disabledKeys?.includes(tool.key)) &&
                  !whiteListKeys.includes(tool.key)
                }
                key={tool.key}
                icon={tool.icon}
                label={tool.label}
                onClick={() => {
                  if (tool.component) {
                    const findItem = tabs.find((item) => item.key === tool.key);
                    if (!findItem) {
                      const newTabs = [...tabs, tool];
                      setTabs(newTabs);
                      setTimeout(() => {
                        luckysheet.resize();
                      }, 0);
                    }
                    setCurrentTab(tool.key);
                  }
                  tool?.onClick?.();
                }}
              />
            ))}
          </div>
          <LuckSheet model={sheetModel} height={height - 252} />
        </div>
        {tabs?.length > 0 ? (
          <div className={styles.sidebarWrap}>
            <Tabs
              className={styles.tabsWrap}
              placement={'top'}
              size={'medium'}
              disabled={false}
              defaultValue={1}
              value={currentTab}
              onChange={setCurrentTab}
              onRemove={({ value }) => {
                const newTabs = tabs.filter((panel) => panel.value !== value);
                setTabs(newTabs);
                setTimeout(() => {
                  luckysheet.resize();
                }, 0);
              }}
            >
              {tabs.map(({ key, label, component }, index) => (
                <TabPanel
                  className={styles.tabPanel}
                  destroyOnHide={false}
                  key={key}
                  value={key}
                  label={label}
                  removable={true}
                  onRemove={() => {
                    setTabs((tabs) => {
                      tabs.splice(index, 1);
                      return tabs;
                    });
                  }}
                >
                  {component}
                </TabPanel>
              ))}
            </Tabs>
          </div>
        ) : null}
      </div>
    </Loading>
  );
};
