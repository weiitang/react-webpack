/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useRef, useState } from 'react';
import {
  PageBox,
  PageBar,
  PageContent,
  SectionBox,
} from '@src/components/page-box';
// import { useModuleNavigator, useRouteParams } from '@core';
import { Button, MessagePlugin, Alert, Space, Drawer } from 'tdesign-react';
// import { Api, ApiConfig } from '@shared/api';
import { toast } from '@src/components/td-plugin/tdesign-plugin';
import { toLocal } from '@src/utils/utc';
import { ClipBoardService } from '@src/lib/clipboard.service';
import { useRequest } from '@src/hook';
import { useDispatch, useSelector, NAMESPACE } from '@model/index';
import { SheetModel, ROLE, scriptsUrlList } from './index';
// import { isDevelopment } from '@src/helper/env';
import scriptLoader from 'react-async-script-loader';
// import { hasPermission, getMembersString } from '../utils';
import { Sheet, ToolKey } from './components/sheet';
import { ListItem } from './components/common/list-item';
// import { dlSubmitDialog } from './components/dl-submit-dialog';
// import { rollbackDialog } from './components/rollback-dialog';
// import { auditorSubmitDialog } from './components/auditor-submit-dialog';
// import { Sidebar } from './components/sidebar';
import * as styles from './index.less';

function SheetDemo(props) {
  const params = { id: '' };
  const dispath = useDispatch(NAMESPACE.sheet);
  const state = useSelector(NAMESPACE.sheet)?.[params.id];
  const sheet = useRef(null);

  // 拥有角色
  const [roles, setRoles] = useState([]);
  // 提交共享的权限
  // const [sharePermission, setSharePermission] = useState(false);
  // 提交审核结果的权限
  // const [auditPermission, setAuditPermission] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectCell, setSelectCell] = useState({ r: 0, c: 0, cell: null });
  const [drawerVisible, setDrawerVisible] = useState(false);

  const { run: getSheetDetail } = useRequest(
    async () => {
      const res = await dispath.getSheetDetail(params.id);
      const config = {
        title: `${res?.company?.name || ''}${res?.latestVersion?.version}`,
        hook: {
          rangeSelect(index, sheet) {
            // console.info('rangeSelect---->>', index, sheet);
          },
          cellMousedown(cell, position) {
            setSelectCell({ c: position.c, r: position.r, cell });
            // console.log('cellMousedown---->>', cell, position);
          },
          sheetDeleteBefore(sheet) {
            const data = luckysheet.toJson().data?.[0];
            if (
              (data.index === sheet.sheet.index &&
                data.name === sheet.sheet.name) ||
              sheet?.sheet?.isDefault
            ) {
              toast('默认表格不能删除', 'error');
              return false;
            }
          },
          sheetEditNameBefore(sheet) {
            const data = luckysheet.toJson().data?.[0];
            if (sheet.i === data.index) {
              toast('默认表格不能重命名', 'error');
              return false;
            }
          },
        },
      };
      // 第一个sheet需要使用公司名
      if (res.sheets?.length > 0 && res?.company?.name) {
        res.sheets[0].name = res.company.name;
      }
      sheet.current = new SheetModel({
        data: res.sheets,
        version: res?.version,
        config,
        language: 'zh',
      });
      setLoading(false);
      return res;
    },
    {
      manual: true,
      onError: (e) => {
        console.log(e);
        toast(e?.msg || '系统错误', 'error');
      },
    }
  );

  useEffect(() => {
    // 从详情中判断用户是否有提交权限
    const _roles = [];
    if (true) {
      _roles.push(ROLE.root);
    }
    // 从所有角色中遍历找到对应角色
    [ROLE.audit, ROLE.dl, ROLE.follower]?.forEach((roleKey) => {
      const hasPermission = state?.company?.[roleKey]?.some(
        (item) => item.userId === ''
      );
      if (hasPermission) {
        _roles.push(roleKey);
      }
    });
    setRoles(_roles);
    const status = state?.latestVersion?.status?.id;
    // 对应角色对应状态的可编辑中 是否包含当前角色
    const sharePermission = roles
      ?.filter((item) => [ROLE.root, ROLE.dl, ROLE.follower].includes(item))
      ?.some((role) => true);
    const auditPermission = roles
      ?.filter((item) => [ROLE.root, ROLE.audit].includes(item))
      ?.some((role) => true);
    // setSharePermission(sharePermission);
    // setAuditPermission(auditPermission);
  }, [state]);

  // 当脚本加载完成时 初始化表格
  useEffect(() => {
    if (props.isScriptLoadSucceed) {
      getSheetDetail();
    }
  }, [props.isScriptLoadSucceed]);

  const onClickCopyError = (err: string) => {
    const clip = new ClipBoardService();
    clip.write(err);
  };

  const toastError = (msg) => {
    MessagePlugin.error({
      content: (
        <p>
          {msg}
          <span
            onClick={() => {
              onClickCopyError(msg);
            }}
            className={styles.copy}
          >
            {'复制'}
          </span>
        </p>
      ),
    });
  };

  const { loading: saveLoading, run: saveDetail } = useRequest(
    () =>
      new Promise<any>((req) => {
        console.log('data', sheet.current.getSheetData());
        setTimeout(() => {
          req({});
        }, 1000);
      }),
    {
      manual: true,
      onSuccess(res) {
        const version = res?.latestVersion?.version;
        toast('个人版本保存成功，版本号：', 'success');
        getSheetDetail();
      },
      onError(err) {
        toastError(err.msg);
      },
    }
  );

  const rollbackDetail = () => {
    new Promise<any>((req) => {
      req(true);
    }).then(
      (res) => {
        const version = res?.latestVersion?.version;
        toast('回收编辑权成功', 'success');
        getSheetDetail();
      },
      (err) => {
        toastError(err.msg);
      }
    );
  };

  const submitShareVersion = () => {
    new Promise<any>((req) => {
      req({});
    }).then(
      (res) => {
        const version = res?.latestVersion?.version;
        toast('共享版本提交成功，版本号：', 'success');
        getSheetDetail();
      },
      (err) => {
        toastError(err.msg);
      }
    );
  };

  const submitAuditResult = () => {
    new Promise<any>((req) => {
      req({});
    }).then(
      (res) => {
        const version = res?.latestVersion?.version;
        toast('共享版本提交成功，版本号：111', 'success');
        getSheetDetail();
      },
      (err) => {
        toastError(err.msg);
      }
    );
  };

  const publishPermission = true;
  const auditPermission = true;

  return (
    <PageBox>
      <PageBar></PageBar>
      <PageContent direction="y" className={styles.flexBox}>
        <SectionBox full>
          {/* debug使用 */}
          {true ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                rowGap: 10,
              }}
            >
              <Space style={{ margin: '10px' }}></Space>
              <Space style={{ margin: '10px' }}>
                <Button onClick={() => setDrawerVisible(true)} theme="primary">
                  展示操作栏
                </Button>
              </Space>
            </div>
          ) : null}
          {publishPermission !== undefined &&
          !publishPermission &&
          auditPermission !== undefined &&
          !auditPermission ? (
            <div className={styles.alertWrap}>
              <Alert
                message={
                  '），您暂无共享版本的编辑权，如果保存个人版本，未来可能造成版本冲突。'
                }
                theme="info"
              />
            </div>
          ) : null}

          <div className={styles.headerWrap}>
            <div className={styles.left}>
              <div className={styles.detail}>
                <ListItem
                  label={'当前版本'}
                  value={state?.latestVersion?.version}
                />
                <ListItem
                  label={'最近保存时间'}
                  value={toLocal(state?.latestVersion?.updateTime, {
                    format: 'YYYY-MM-DD HH:mm:ss',
                  })}
                />
              </div>
              <ListItem label={'说明'} value={state?.latestVersion?.remark} />
            </div>
            <div className={styles.right}>
              {true ? (
                <Button
                  onClick={() => rollbackDetail()}
                  theme="primary"
                  variant="outline"
                >
                  回收编辑权
                </Button>
              ) : null}
              {true ? (
                <Button
                  loading={saveLoading}
                  onClick={() => saveDetail()}
                  theme="primary"
                  variant="outline"
                >
                  保存个人版本
                </Button>
              ) : null}
              {roles?.some((item) =>
                [ROLE.root, ROLE.dl, ROLE.follower].includes(item)
              ) || publishPermission ? (
                <Button
                  disabled={!publishPermission}
                  onClick={() => submitShareVersion()}
                  theme="primary"
                >
                  提交共享版本
                </Button>
              ) : null}
              {roles?.some((item) => [ROLE.root, ROLE.audit].includes(item)) ||
              auditPermission ? (
                <Button
                  disabled={!auditPermission}
                  onClick={() => submitAuditResult()}
                  theme="primary"
                >
                  提交审核结果
                </Button>
              ) : null}
            </div>
          </div>
          <Sheet
            sheetModel={sheet.current}
            loading={loading}
            recordId={params.id}
            disabledKeys={
              !publishPermission && !auditPermission
                ? [
                    ToolKey.import,
                    ToolKey.attachments,
                    ToolKey.remark,
                    ToolKey.editArea,
                  ]
                : []
            }
          />
          {true ? (
            <Drawer
              sizeDraggable
              className={styles.drawerWrap}
              placement="right"
              size={'350px'}
              showOverlay={false}
              header={false}
              footer={false}
              closeBtn={false}
              visible={drawerVisible}
              onClose={() => setDrawerVisible(false)}
            >
              {sheet.current ? (
                // <Sidebar
                //   model={sheet.current}
                //   onCloseSidebar={() => setDrawerVisible(false)}
                //   selectCell={selectCell}
                // />
                <>Sidebar</>
              ) : null}
            </Drawer>
          ) : null}
        </SectionBox>
      </PageContent>
    </PageBox>
  );
}

export default scriptLoader(scriptsUrlList)(SheetDemo);
