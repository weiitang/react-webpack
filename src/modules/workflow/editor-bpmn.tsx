/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable no-nested-ternary */
/**
 * 流程引擎 - 编辑器 - BPMN编辑器
 */

import { forwardRef, useEffect, useRef, useState } from 'react';
import { Alert, Button, DialogPlugin, MessagePlugin } from 'tdesign-react';
import classNames from 'classnames';
// import { useRouteParams, useRouteNavigate } from '@core';
import { useEvent } from '@src/hook';
import {
  setLocal,
  getLocal,
  clearLocal,
  STORAGE_KEY,
} from '@src/lib/localStorage';
import { ReactBpmn } from './react-bpmn';
import * as styles from './editor.less';
import { on, off } from './custom/eventbus';
import Store from './custom/store';
import { entityToCDATA, downloadBpmn } from './custom/utils';
import { getPropertyType, PropertyPanel } from './property-panel';

// 是否开启提交时转为CDATA模式
const CDATA_ENABLED = false;

export interface EditorBpmnProps {
  className?: string;
  /**
   * 是否只读
   */
  readonly?: boolean;
  /**
   * 模块ID
   */
  moduleId: string;
  /**
   * xml内容
   */
  defaultXML?: string | ArrayBuffer;
  /**
   * 点击取消按钮回调
   */
  onCancel?: () => void;
  /**
   * 保存
   */
  onSave?: (isEdit: boolean, xml: string) => Promise<any>;
  /**
   * 提交
   */
  onSubmit?: (isEdit: boolean, xml: string) => void;
}

export const EditorBpmn = forwardRef<HTMLDivElement, EditorBpmnProps>(
  (props, ref) => {
    // const navigate = useRouteNavigate();

    const {
      className,
      readonly,
      moduleId,
      defaultXML,
      onCancel: onCancelHandler,
      onSave: onSaveHandler,
      onSubmit: onSubmitHandler,
    } = props;
    const bpmnRef = useRef<any>(null);
    const xmlInitRef = useRef<any>(null);
    const fileInputRef = useRef<HTMLInputElement | any>();
    const [showTips, setShowTips] = useState(false);
    const [bpmnXML, setBpmnXML] = useState<any | ArrayBuffer>();
    const [loading, setLoading] = useState(false);
    const [propertyElement, setPropertyElement] = useState(null);
    // const params = useRouteParams();
    // const isEdit = !!params.id;

    useEffect(() => {
      if (!readonly) {
        const cache = initCache();
        setShowTips(!!cache);
      }

      on('workflow.importFile', importFile);
      on('workflow.downloadFile', downloadFile);
      const timer = setInterval(setCurrentCache, 10000);

      return () => {
        off('workflow.importFile', importFile);
        off('workflow.downloadFile', downloadFile);
        clearInterval(timer);
      };
    }, []);

    useEffect(() => {
      if (defaultXML) {
        setBpmnXML(defaultXML);
      } else {
        // 新增
        setBpmnXML('new');
      }
    }, [defaultXML]);

    useEffect(() => {
      Store.set('params', {
        moduleId,
      });
    }, [moduleId]);

    const onBpmnInit = (bpmnInstance: any) => {
      bpmnRef.current = bpmnInstance;

      bpmnInstance.on('selection.changed', onSelectionChanged);
      // bpmnInstance.on('element.changed', (e) => {
      //   console.log('element.changed', e);
      // });
    };

    const onXmlInit = (xml: string) => {
      xmlInitRef.current = xml;
    };

    const onSelectionChanged = (e) => {
      const element = e.newSelection[0];
      const type = getPropertyType(element);
      if (type && element) {
        setPropertyElement(element);
      } else {
        setPropertyElement(null);
      }
    };

    const onCancel = () => {
      if (onCancelHandler) {
        onCancelHandler();
      }
    };

    // 经过saveXML后，敏感字符会被转为实体符
    // 即bpmnjs内部自动转换敏感字符，渲染时不需要额外处理
    // https://forum.bpmn.io/t/formalexpressions-cdata/2851
    const getXML = async (options?: any) =>
      // 这里会触发react-bpmn.tsx的saveXML.serialized事件进行处理
      await bpmnRef.current.saveXML({
        format: true,
        ...options,
      });

    // const onSubmit = async (isSave: boolean) => {
    //   try {
    //     let { xml } = await getXML();

    //     // 将被转义为实体符的CDATA还原为标签，传给后台
    //     // 提交时才触发，不在xmlToSave里处理，这里侵入性较低
    //     if (CDATA_ENABLED) {
    //       xml = entityToCDATA(xml);
    //     }

    //     try {
    //       setLoading(true);
    //       if (isSave) {
    //         await onSaveHandler(isEdit, xml);
    //       } else {
    //         await onSubmitHandler(isEdit, xml);
    //       }

    //       clearLocal(STORAGE_KEY.WORKFLOW_CACHE_EDIDING);

    //       // 跳转列表
    //       MessagePlugin.success({
    //         content: isEdit ? '保存成功' : '创建成功',
    //         onDurationEnd() {
    //           if (!isEdit) {
    //             navigate('');
    //           }
    //         },
    //       });
    //     } catch (e) {
    //       MessagePlugin.error(e.message);
    //     } finally {
    //       setLoading(false);
    //     }
    //   } catch (e) {
    //     MessagePlugin.error(e.message);
    //   }
    // };

    const onSubmitTest = async () => {
      try {
        let { xml } = await getXML();

        if (CDATA_ENABLED) {
          xml = entityToCDATA(xml);
        }

        console.warn(xml);
      } catch (e: any) {
        MessagePlugin.error(e?.message);
      }
    };

    const importFile = useEvent(() => {
      if (!window.FileReader) {
        MessagePlugin.error('当前浏览器不支持通过FileReader读取文件');
        return;
      }

      const el = fileInputRef.current;
      if (el) {
        el.value = ''; // 避免多次选择onchange不触发
        el?.click();
      }

      // 重置为空，避免多次上传同一个文件后不生效（bpmnXML没变化）
      setBpmnXML('');
    });

    const onFileChange = (e: any) => {
      const dialog = DialogPlugin.confirm({
        header: '提示',
        body: '这将覆盖您对当前图表所做的更改。',
        // body: '确定使用导入的文件内容替换当前工作区吗？',
        onConfirm() {
          dialog.hide();
          clearLocal(STORAGE_KEY.WORKFLOW_CACHE_EDIDING);

          const file = e.target.files[0];
          const reader = new FileReader();
          reader.onload = (evt) => {
            setBpmnXML(evt?.target?.result);
          };
          reader.onerror = () => {
            MessagePlugin.error(reader?.error?.message as string);
          };
          reader.readAsText(file);
        },
        onClose() {
          dialog.hide();
        },
      });
    };

    const downloadFile = useEvent(async () => {
      try {
        const { xml } = await getXML();
        if (xml) {
          downloadBpmn('diagram.xml', xml);
        }
      } catch (e: any) {
        MessagePlugin.error(e?.message);
      }
    });

    const initCache = () => {
      const cache = getLocal(STORAGE_KEY.WORKFLOW_CACHE_EDIDING);
      // 存在编辑中异常退出的数据，迁移到正常的缓存key
      if (cache) {
        clearLocal(STORAGE_KEY.WORKFLOW_CACHE_EDIDING);
        setLocal(STORAGE_KEY.WORKFLOW_CACHE, cache);
        return cache;
      }
      return getLocal(STORAGE_KEY.WORKFLOW_CACHE);
    };

    const setCurrentCache = async () => {
      if (!xmlInitRef.current) {
        return;
      }

      try {
        const { xml } = await getXML({
          format: false,
        });

        // 跟初始化比较没有变化，不保存
        if (xml === xmlInitRef.current) {
          return;
        }

        if (xml) {
          setLocal(STORAGE_KEY.WORKFLOW_CACHE_EDIDING, xml);
        }
      } catch (e) {
        // nothing
      }
    };

    const recoverLocalCache = () => {
      const dialog = DialogPlugin.confirm({
        header: '提示',
        body: '这将覆盖您对当前图表所做的更改。',
        // body: '确定使用导入的文件内容替换当前工作区吗？',
        onConfirm() {
          dialog.hide();

          const xml = getLocal(STORAGE_KEY.WORKFLOW_CACHE);
          if (xml) {
            setBpmnXML(xml);
          }

          clearLocal(STORAGE_KEY.WORKFLOW_CACHE);
          setShowTips(false);
        },
        onClose() {
          dialog.hide();
        },
      });
    };

    return (
      <div ref={ref} className={classNames(styles.bpmnWrapper, className)}>
        {/* <div className={styles.bpmnNav}>
        <div className={styles.bpmnToolTitle}>流程图工具</div>
      </div> */}
        <div className={styles.bpmnEditor}>
          {showTips ? (
            <div className={styles.info}>
              <Alert
                theme="info"
                message="存在未正确保存的流程图数据"
                operation={<span onClick={recoverLocalCache}>恢复</span>}
                close
                onClose={() => {
                  clearLocal(STORAGE_KEY.WORKFLOW_CACHE);
                  setShowTips(false);
                }}
              />
            </div>
          ) : null}
          <ReactBpmn
            className={styles.bpmnContainer}
            readonly={readonly}
            xml={bpmnXML}
            onInit={onBpmnInit}
            onXmlInit={onXmlInit}
          />
          {propertyElement ? (
            <div className={styles.propertyPanel}>
              <PropertyPanel
                modeler={bpmnRef.current}
                element={propertyElement}
                readonly={readonly}
              />
            </div>
          ) : null}
          <input
            type="file"
            accept=".bpmn,.xml"
            onChange={onFileChange}
            className={styles.fileInput}
            ref={fileInputRef}
          />
        </div>
        <div className={styles.bpmnBtns}>
          {!readonly ? (
            <>
              <Button
                theme="primary"
                loading={loading}
                onClick={() => {
                  // onSubmit(false);
                  console.log('创建');
                }}
              >
                完成创建
              </Button>
              {/* <Button
                theme="default"
                loading={loading}
                onClick={() => {
                  onSubmit(true);
                }}
              >
                保存
              </Button> */}
            </>
          ) : null}
          <Button theme="default" loading={loading} onClick={onCancel}>
            {readonly ? (history.length <= 1 ? '关闭' : '返回') : '上一步'}
          </Button>
          {process.env.NODE_ENV === 'development' ? (
            <Button
              theme="default"
              loading={loading}
              onClick={() => onSubmitTest()}
            >
              打印XML
            </Button>
          ) : null}
        </div>
      </div>
    );
  }
);
