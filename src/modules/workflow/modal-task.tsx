/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 流程引擎 - 任务弹出层
 */
import { useEffect, useState, useRef } from 'react';
import {
  Switch,
  Button,
  Select as TSelect,
  MessagePlugin,
} from 'tdesign-react';
// import { FormProvider } from '@shared/components/forms';
// import { Form, FormItem, Input, InputText } from '@src/components/forms';
// import { useController } from '@core';
// import { getFormData } from './custom/node';
// import {
//   NodeId,
//   NodeName,
//   NodeNameEn,
//   IsSkippable,
//   SkipCondition,
//   SkipApprovalRoles,
//   SkipApprovalType,
//   CompleteApprovalRoles,
//   CompleteApprovalType,
//   CustomInitStage,
//   IsOverridable,
//   OverrideCondition,
//   OverrideApprovalRoles,
//   OverrideApprovalType,
//   IsRollbackable,
//   IsSuspendable,
//   IsAutoStart,
//   IsAutoContinue,
//   IsUncompleteTrigger,
//   CompleteCondition,
//   RequiredExecution,
//   OptionalExecution,
//   NeedlessExecution,
//   SendTaskType,
//   SendTo,
//   SendCC,
//   SendBCC,
//   SendSubject,
//   SendText,
//   Script,
//   BaseTaskFormModel,
// } from './models/bpmn.model';
// import { TaskFormController } from './controllers/task-form.controller';
// import { getRoles } from './services/workflow.dataservice';
import * as styles from './modal.less';
import { is$1 } from './custom/bpmn-utils';
import Store from './custom/store';

export interface OptionsProps {
  title?: string;
  element: any;
  readonly?: boolean;
  onCancel?: () => void;
  onConfirm: (model: any) => void;
}

export const TaskForm = (props: OptionsProps) => {
  const { element, readonly, onCancel, onConfirm } = props;
  // const controller = useController(TaskFormController);
  const modelRef = useRef(null);
  const [validateStatus, setValidateStatus] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendType, setSendType] = useState('mail');
  const [, forceUpdate] = useState(null);

  // useEffect(() => {
  //   const value = getFormData(element);
  //   let model = null;
  //   if (is$1(element, 'bpmn:UserTask')) {
  //     model = controller.userTaskModel;
  //   } else if (is$1(element, 'bpmn:SendTask')) {
  //     model = controller.sendTaskModel;
  //   } else if (is$1(element, 'bpmn:ScriptTask')) {
  //     model = controller.scriptTaskModel;
  //   } else {
  //     model = controller.baseTaskFormModel;
  //   }

  //   modelRef.current = model;

  //   // 先执行一次，避免显示慢
  //   if (value) {
  //     model.fromJSON(value);
  //   }

  //   // 继承于BaseTaskFormModel的才要查询角色
  //   if (model instanceof BaseTaskFormModel) {
  //     initRoles(value);
  //   }
  // }, [element]);

  // const initRoles = async (defaultValue: any) => {
  //   try {
  //     setLoading(true);
  //     const model = modelRef.current;
  //     const { moduleId } = Store.get('params');
  //     let roles = Store.get(`roles_${moduleId}`); // 角色是根据模块id查询的

  //     if (!roles) {
  //       roles = await getRoles(moduleId);
  //       Store.set('roles', roles);
  //     }

  //     model.use(SkipApprovalRoles).options = roles;
  //     model.use(CompleteApprovalRoles).options = roles;
  //     model.use(OverrideApprovalRoles).options = roles;

  //     // 初始化角色完毕再初始化表单值
  //     if (defaultValue) {
  //       model.fromJSON(defaultValue);
  //     }
  //   } catch (e) {
  //     MessagePlugin.error(e.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const onSubmit = () => {
  //   const model = modelRef.current;
  //   const errors = model.validate();

  //   if (errors.length > 0) {
  //     setValidateStatus(true);
  //     return;
  //   }

  //   onConfirm?.(model);
  // };

  // const switchSendType = (option) => {
  //   // 内置的onchange不会触发重新渲染，所以这里通过state触发
  //   setSendType(option.id);
  // };

  // const model = modelRef.current;

  // if (!model) {
  //   return null;
  // }

  // return (
  //   <Form labelAlign="top" onSubmit={() => onSubmit()} className={styles.form}>
  //     <div className={styles.formContent}>
  //       <FormProvider model={model} validateStatus={validateStatus}>
  //         <FormItem meta={NodeId} component={Input} props={{ readonly }} />
  //         <FormItem meta={NodeName} component={Input} props={{ readonly }} />
  //         <FormItem meta={NodeNameEn} component={Input} props={{ readonly }} />
  //         <FormItem
  //           meta={CompleteApprovalRoles}
  //           render={(props, { options }) => (
  //             <TSelect
  //               {...props}
  //               multiple
  //               options={options}
  //               readonly={readonly}
  //               valueType="object"
  //               keys={{ value: 'roleId', label: 'roleName' }}
  //             />
  //           )}
  //         />
  //         <FormItem
  //           meta={CompleteApprovalType}
  //           render={(props, { options }) => (
  //             <TSelect
  //               {...props}
  //               options={options}
  //               readonly={readonly}
  //               valueType="object"
  //               keys={{ value: 'id', label: 'name' }}
  //             />
  //           )}
  //         />
  //         <FormItem
  //           meta={CustomInitStage}
  //           render={(props) => (
  //             <InputText
  //               {...props}
  //               rows={4}
  //               className={styles.miniInputText}
  //               readonly={readonly}
  //             />
  //           )}
  //         />
  //         <FormItem
  //           labelAlign="left"
  //           labelWidth="auto"
  //           meta={IsSkippable}
  //           render={({ value, onChange }) => (
  //             <Switch
  //               value={value}
  //               disabled={readonly}
  //               onChange={(val) => {
  //                 onChange(val);
  //                 forceUpdate({});
  //               }}
  //             />
  //           )}
  //         />

  //         {model.isSkippable ? (
  //           <>
  //             <FormItem
  //               meta={SkipCondition}
  //               render={(props) => (
  //                 <InputText
  //                   {...props}
  //                   className={styles.inputText}
  //                   readonly={readonly}
  //                 />
  //               )}
  //             />
  //             <FormItem
  //               meta={SkipApprovalRoles}
  //               render={(props, { options }) => (
  //                 <TSelect
  //                   {...props}
  //                   multiple
  //                   options={options}
  //                   readonly={readonly}
  //                   valueType="object"
  //                   keys={{ value: 'roleId', label: 'roleName' }}
  //                 />
  //               )}
  //             />
  //             <FormItem
  //               meta={SkipApprovalType}
  //               render={(props, { options }) => (
  //                 <TSelect
  //                   {...props}
  //                   options={options}
  //                   readonly={readonly}
  //                   valueType="object"
  //                   keys={{ value: 'id', label: 'name' }}
  //                 />
  //               )}
  //             />
  //           </>
  //         ) : null}

  //         <FormItem
  //           labelAlign="left"
  //           labelWidth="auto"
  //           meta={IsOverridable}
  //           render={({ value, onChange }) => (
  //             <Switch
  //               value={value}
  //               disabled={readonly}
  //               onChange={(val) => {
  //                 onChange(val);
  //                 forceUpdate({});
  //               }}
  //             />
  //           )}
  //         />

  //         {model.isOverridable ? (
  //           <>
  //             <FormItem
  //               meta={OverrideCondition}
  //               render={(props) => (
  //                 <InputText
  //                   {...props}
  //                   className={styles.inputText}
  //                   readonly={readonly}
  //                 />
  //               )}
  //             />
  //             <FormItem
  //               meta={OverrideApprovalRoles}
  //               render={(props, { options }) => (
  //                 <TSelect
  //                   {...props}
  //                   multiple
  //                   options={options}
  //                   readonly={readonly}
  //                   valueType="object"
  //                   keys={{ value: 'roleId', label: 'roleName' }}
  //                 />
  //               )}
  //             />
  //             <FormItem
  //               meta={OverrideApprovalType}
  //               render={(props, { options }) => (
  //                 <TSelect
  //                   {...props}
  //                   options={options}
  //                   readonly={readonly}
  //                   valueType="object"
  //                   keys={{ value: 'id', label: 'name' }}
  //                 />
  //               )}
  //             />
  //           </>
  //         ) : null}

  //         <FormItem
  //           labelAlign="left"
  //           labelWidth="auto"
  //           meta={IsRollbackable}
  //           render={({ value, onChange }) => (
  //             <Switch value={value} onChange={onChange} disabled={readonly} />
  //           )}
  //         />
  //         <FormItem
  //           labelAlign="left"
  //           labelWidth="auto"
  //           meta={IsSuspendable}
  //           render={({ value, onChange }) => (
  //             <Switch value={value} onChange={onChange} disabled={readonly} />
  //           )}
  //         />
  //         <FormItem
  //           labelAlign="left"
  //           labelWidth="auto"
  //           meta={IsAutoStart}
  //           render={({ value, onChange }) => (
  //             <Switch value={value} onChange={onChange} disabled={readonly} />
  //           )}
  //         />
  //         <FormItem
  //           labelAlign="left"
  //           labelWidth="auto"
  //           meta={IsAutoContinue}
  //           render={({ value, onChange }) => (
  //             <Switch value={value} onChange={onChange} disabled={readonly} />
  //           )}
  //         />
  //         <FormItem
  //           labelAlign="left"
  //           labelWidth="auto"
  //           meta={IsUncompleteTrigger}
  //           render={({ value, onChange }) => (
  //             <Switch value={value} onChange={onChange} disabled={readonly} />
  //           )}
  //         />
  //         <FormItem
  //           meta={CompleteCondition}
  //           render={(props) => (
  //             <InputText
  //               {...props}
  //               className={styles.inputText}
  //               readonly={readonly}
  //             />
  //           )}
  //         />
  //         <FormItem
  //           meta={RequiredExecution}
  //           render={(props) => (
  //             <InputText
  //               {...props}
  //               className={styles.inputText}
  //               readonly={readonly}
  //             />
  //           )}
  //         />
  //         <FormItem
  //           meta={OptionalExecution}
  //           render={(props) => (
  //             <InputText
  //               {...props}
  //               className={styles.inputText}
  //               readonly={readonly}
  //             />
  //           )}
  //         />
  //         <FormItem
  //           meta={NeedlessExecution}
  //           render={(props) => (
  //             <InputText
  //               {...props}
  //               className={styles.inputText}
  //               readonly={readonly}
  //             />
  //           )}
  //         />
  //         {is$1(element, 'bpmn:SendTask') ? (
  //           <>
  //             <FormItem
  //               meta={SendTaskType}
  //               render={({ onChange, ...otherProps }, { options }) => (
  //                 <TSelect
  //                   {...otherProps}
  //                   options={options}
  //                   valueType="object"
  //                   readonly={readonly}
  //                   keys={{ value: 'id', label: 'name' }}
  //                   onChange={(value) => {
  //                     onChange(value);
  //                     switchSendType(value);
  //                   }}
  //                 />
  //               )}
  //             />
  //             <FormItem meta={SendTo} component={Input} props={{ readonly }} />
  //             {sendType === 'mail' ? (
  //               <FormItem
  //                 meta={SendCC}
  //                 component={Input}
  //                 props={{ readonly }}
  //               />
  //             ) : null}
  //             {sendType === 'mail' ? (
  //               <FormItem
  //                 meta={SendBCC}
  //                 component={Input}
  //                 props={{ readonly }}
  //               />
  //             ) : null}
  //             <FormItem
  //               meta={SendSubject}
  //               component={Input}
  //               props={{ readonly }}
  //             />
  //             <FormItem
  //               meta={SendText}
  //               render={(props) => (
  //                 <InputText
  //                   {...props}
  //                   className={styles.inputText}
  //                   readonly={readonly}
  //                 />
  //               )}
  //             />
  //           </>
  //         ) : null}
  //         {is$1(element, 'bpmn:ScriptTask') ? (
  //           <FormItem
  //             meta={Script}
  //             render={(props) => (
  //               <InputText
  //                 {...props}
  //                 className={styles.inputText}
  //                 readonly={readonly}
  //               />
  //             )}
  //           />
  //         ) : null}
  //       </FormProvider>
  //     </div>
  //     <div className={styles.btnFooter}>
  //       {onCancel && !readonly ? (
  //         <Button
  //           theme="default"
  //           loading={loading}
  //           className={styles.btn}
  //           onClick={() => onCancel?.()}
  //         >
  //           取消
  //         </Button>
  //       ) : null}
  //       {!readonly ? (
  //         <Button type="submit" loading={loading} className={styles.btn}>
  //           保存
  //         </Button>
  //       ) : null}
  //     </div>
  //   </Form>
  // );
  return <div>Task弹出层</div>;
};

// export default function showTaskModal(options: OptionsProps) {
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
//     className: styles.userTaskModal,
//     placement: 'center',
//     header: options.title || '设置',
//     body: <TaskForm {...otherProps} onCancel={onCancelHandler} onConfirm={onConfirmHandler} />,
//     footer: false,
//     onConfirm: () => {
//       mydialog.hide();
//     },
//     onClose: () => {
//       mydialog.hide();
//     },
//   });
//   mydialog.show();
// }
