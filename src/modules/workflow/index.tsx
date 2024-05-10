/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
/**
 * 流程引擎 - 流程图编辑器
 */
import React, { useState, useRef, useEffect } from 'react';
import { PageBox, PageContent, SectionBox } from '@src/components/page-box';
// import { useModuleNavigator, useModuleParams, useRouteParams } from '@core';
// import { Crumbs } from '@src/components/crumbs';
// import { Steps } from '@src/components/steps';
import { MessagePlugin, DialogPlugin } from 'tdesign-react';
import { useEvent } from '@src/hook';
import { content, content1 } from './config';
// import { EditorInfo } from './editor-info';
import { EditorBpmn } from './editor-bpmn';
import type { FlowModelProps } from './models/types';
import * as styles from './editor.less';
// import {
//   getFlow,
//   createFlow,
//   updateFlow,
//   getInstanceDetail,
// } from './services/workflow.dataservice';

export function Workflow() {
  // const navigators = useModuleNavigator();
  // const params = useModuleParams();
  const [currentStep, setCurrentStep] = useState('bpmn');
  const [loading, setLoading] = useState(false);
  const bpmnRef = useRef(null);
  const [value, setValue] = useState<FlowModelProps>({ content: content1 });
  const infoDataRef = useRef<FlowModelProps | any>();
  const historyStateCountRef = useRef(0);
  const dialogInstance = useRef<any>(null);

  // const onValuesChange = (values: unknown) => {
  //   infoDataRef.current = values as FlowModelProps;
  // };

  const goNext = (model: FlowModelProps) => {
    infoDataRef.current = model;
    setCurrentStep('bpmn');
  };

  const onBpmnCancel = () => {
    setCurrentStep('info');
  };

  // const onBpmnSave = (xml: string) =>
  //   saveFlow({
  //     ...infoDataRef.current,
  //     bpmn: xml,
  //   });

  const onBpmnSubmit = (isEdit: boolean, xml: string) => {
    console.log('isEdit', isEdit, xml);
  };
  // isEdit
  //   ? updateFlow(params.id, {
  //       ...infoDataRef.current,
  //       content: xml,
  //     })
  //   : createFlow({
  //       ...infoDataRef.current,
  //       content: xml,
  //     });

  const isFormValidate = () => {
    const data = infoDataRef.current || {};
    let success = true;
    Object.keys(data).forEach((v) => {
      if (!data[v]) {
        success = false;
      }
    });

    return success;
  };

  const onStepChange = (current: string | number) => {
    if (current === currentStep) {
      return;
    }

    if (current === 'bpmn' && !isFormValidate()) {
      return;
    }

    setCurrentStep(current as string);
  };

  const queryFlow = async (params: any) => {
    try {
      const { id, copyId, instanceId } = params;

      setLoading(true);
      // const response = instanceId
      //   ? await getInstanceDetail(instanceId)
      //   : await getFlow(id || copyId);
      // setValue({});
    } catch (e: any) {
      MessagePlugin.error(e?.message);
    } finally {
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   const { id, copyId, instanceId } = params;

  //   if (id || copyId || instanceId) {
  //     queryFlow(params);
  //   }
  // }, []);

  // 添加history state，来控制返回的动作
  const addState = () => {
    const count = historyStateCountRef.current + 1;
    historyStateCountRef.current = count;
    history.pushState(count, '');
  };

  /**
   * 这里可以控制浏览器返回按钮，左滑返回等触发的动作
   * 注意：
   * 1） 若连续触发返回，会直接退出；
   * 2） 点击页面其他链接，会直接退出
   */
  const onPopstate = useEvent(() => {
    // 在编辑器界面返回，切换到info，再返回退出确认
    if (currentStep === 'bpmn') {
      addState();
      setCurrentStep('info');
      return;
    }

    const dialog = DialogPlugin.confirm({
      header: '提示',
      body: '确定要退出吗？',
      onConfirm: async () => {
        dialog.hide();
        history.back();
      },
      onClose() {
        dialog.hide();
        addState();
      },
    });

    dialogInstance.current = dialog;
  });

  const onBeforeunload = useEvent((event) => {
    const e = event || window.event;
    const tips = '退出确认';
    // 兼容IE8和Firefox 4之前的版本
    if (e) {
      e.returnValue = tips;
    }
    // Chrome, Safari, Firefox 4+, Opera 12+ , IE 9+
    return tips;

    // return null实测不行
    // return undefined;
  });

  useEffect(() => {
    // 存在state,按返回时才会触发onpopstate
    addState();
    window.addEventListener('popstate', onPopstate);

    window.addEventListener('beforeunload', onBeforeunload);

    return () => {
      if (dialogInstance.current) {
        dialogInstance.current.hide();
      }

      window.removeEventListener('popstate', onPopstate);
      window.removeEventListener('beforeunload', onBeforeunload);
    };
  }, []);

  return (
    <PageBox>
      {/* <PageBar>
        <Crumbs options={navigators} />
      </PageBar> */}

      <PageContent>
        <SectionBox full>
          <div className={styles.wrapper}>
            <div className={styles.formWrapper}>
              {currentStep === 'bpmn' || bpmnRef.current ? (
                <EditorBpmn
                  ref={bpmnRef}
                  // readonly={readonly}
                  moduleId={infoDataRef.current?.moduleId}
                  defaultXML={value?.content}
                  // editorInfoModel={infoDataRef.current}
                  onCancel={onBpmnCancel}
                  // onSave={onBpmnSave}
                  onSubmit={onBpmnSubmit}
                  className={currentStep === 'info' ? styles.hide : ''}
                />
              ) : null}
            </div>
          </div>
        </SectionBox>
      </PageContent>
    </PageBox>
  );
}
