/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 流程引擎 - SequenceFlow
 */
import { useEffect, useRef, useState } from 'react';
import { Form, Button } from 'tdesign-react';
// import { FormProvider } from '@shared/components/forms';
// import { FormItem, Input, InputText } from '@src/components/forms';
// import { useController } from '@core';
// import { SequenceFlowFormController } from './controllers/sequence-flow-form.controller';
// import { NodeId, NodeName, NodeNameEn, ConditionMeta } from './models/bpmn.model';
import * as styles from './modal.less';
// import { getFormData } from './custom/node';

export interface OptionsProps {
  title?: string;
  element: any;
  readonly?: boolean;
  onCancel?: () => void;
  onConfirm: (model: any) => void;
}

export const SequenceFlowForm = (props: OptionsProps) => {
  // const { element, readonly, onCancel, onConfirm } = props;
  // const controller = useController(SequenceFlowFormController);
  // const modelRef = useRef(null);
  // const [validateStatus, setValidateStatus] = useState(false);

  // useEffect(() => {
  //   const { model } = controller;
  //   modelRef.current = model;

  //   const value = getFormData(element);
  //   if (value) {
  //     model.fromJSON(value);
  //   }
  // }, [element]);

  // const onSubmit = () => {
  //   const model = modelRef.current;
  //   const errors = model.validate();

  //   if (errors.length > 0) {
  //     setValidateStatus(true);
  //     return;
  //   }

  //   onConfirm?.(model);
  // };

  // if (!modelRef.current) {
  //   return null;
  // }

  // return (
  //   <Form labelAlign="top" onSubmit={() => onSubmit()} className={styles.form}>
  //     <div className={styles.formContent}>
  //       <FormProvider model={modelRef.current} validateStatus={validateStatus}>
  //         <FormItem meta={NodeId} component={Input} props={{ readonly }}></FormItem>
  //         <FormItem meta={NodeName} component={Input} props={{ readonly }}></FormItem>
  //         <FormItem meta={NodeNameEn} component={Input} props={{ readonly }}></FormItem>
  //         <FormItem
  //           meta={ConditionMeta}
  //           render={(props) => <InputText {...props} className={styles.inputText} readonly={readonly} />}
  //         ></FormItem>
  //       </FormProvider>
  //     </div>
  //     <div className={styles.btnFooter}>
  //       {onCancel && !readonly ? (
  //         <Button theme="default" className={styles.btn} onClick={() => onCancel?.()}>
  //           取消
  //         </Button>
  //       ) : null}
  //       {!readonly ? (
  //         <Button type="submit" className={styles.btn}>
  //           保存
  //         </Button>
  //       ) : null}
  //     </div>
  //   </Form>
  // );

  return <div>Sequence-flow弹出层</div>;
};

// export default function showSequenceFlowModal(options: OptionsProps) {
//   const { onCancel, onConfirm, ...otherProps } = options;

//   const onCancelHandler = () => {
//     onCancel?.();
//     mydialog.hide();
//   };

//   const onConfirmHandler = (model: any) => {
//     onConfirm?.(model);
//     mydialog.hide();
//   };

//   const mydialog = DialogPlugin({
//     closeOnOverlayClick: false,
//     width: '600px',
//     header: options.title || '设置',
//     body: <SequenceFlowForm {...otherProps} onCancel={onCancelHandler} onConfirm={onConfirmHandler} />,
//     footer: false,
//     onClose: () => {
//       mydialog.hide();
//     },
//   });
//   mydialog.show();
// }
