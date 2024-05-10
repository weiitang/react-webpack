/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 流程引擎 - 事件弹出层
 */
import { useEffect, useRef, useState } from 'react';
import { Form, Button, InputAdornment, InputNumber } from 'tdesign-react';
// import { FormProvider } from '@shared/components/forms';
// import { FormItem, Input, InputText } from '@src/components/forms';
// import { useController } from '@core';
// import { EventFormController } from './controllers/event-form.controller';
// import { NodeId, NodeName, NodeNameEn, ConditionMeta, BoundaryTimer } from './models/bpmn.model';
import * as styles from './modal.less';
import { hasEventDefinition } from './custom/bpmn-utils';
// import { getFormData } from './custom/node';

export interface OptionsProps {
  title?: string;
  element: any;
  readonly?: boolean;
  onCancel?: () => void;
  onConfirm: (model: any) => void;
}

// 计算因子，单位秒
const dayFactor = 24 * 60 * 60;
const hourFactor = 60 * 60;
const minuteFactor = 60;
const secondFactor = 1;

const TimerInput = (props: {
  value: number;
  readonly?: boolean;
  onChange: (result: any) => void;
}) => {
  const { value, readonly, onChange } = props;
  const [day, setDay] = useState<number>();
  const [hour, setHour] = useState<number>();
  const [minute, setMinute] = useState<number>();
  const [second, setSecond] = useState<number>();
  const changeRef = useRef(false);

  useEffect(() => {
    if (!changeRef.current) {
      return;
    }

    if (onChange) {
      let result = 0;
      result += (day || 0) * dayFactor;
      result += (hour || 0) * hourFactor;
      result += (minute || 0) * minuteFactor;
      result += (second || 0) * secondFactor;

      // 单位：秒
      // 0认为是没有输入
      onChange(result || undefined);
    }
  }, [day, hour, minute, second]);

  useEffect(() => {
    if (!value) {
      return;
    }

    let factor = value;
    const day = Math.floor(factor / dayFactor);
    if (day > 0) {
      setDay(day);
      factor = factor - dayFactor * day;
    }

    const hour = Math.floor(factor / hourFactor);
    if (hour > 0) {
      setHour(hour);
      factor = factor - hourFactor * hour;
    }

    const minute = Math.floor(factor / minuteFactor);
    if (minute > 0) {
      setMinute(minute);
      factor = factor - minuteFactor * minute;
    }

    const second = Math.floor(factor / secondFactor);
    if (second > 0) {
      setSecond(second);
    }

    // 前置的有值，后面的补0
    if (day > 0 && hour === 0) {
      setHour(0);
    }

    if ((day > 0 || hour > 0) && minute === 0) {
      setMinute(0);
    }

    if ((day > 0 || hour > 0 || minute > 0) && second === 0) {
      setSecond(0);
    }
  }, []);

  const setChange = () => {
    changeRef.current = true;
  };

  return (
    <div className={styles.timerInput}>
      <InputAdornment append="天">
        <InputNumber
          theme="column"
          min={0}
          value={day}
          readonly={readonly}
          onChange={(value) => {
            setChange();
            setDay(value as number);
          }}
        />
      </InputAdornment>
      <InputAdornment append="时">
        <InputNumber
          theme="column"
          min={0}
          value={hour}
          readonly={readonly}
          onChange={(value) => {
            setChange();
            setHour(value as number);
          }}
        />
      </InputAdornment>
      <InputAdornment append="分">
        <InputNumber
          theme="column"
          min={0}
          value={minute}
          readonly={readonly}
          onChange={(value) => {
            setChange();
            setMinute(value as number);
          }}
        />
      </InputAdornment>
      <InputAdornment append="秒">
        <InputNumber
          theme="column"
          min={0}
          value={second}
          readonly={readonly}
          onChange={(value) => {
            setChange();
            setSecond(value as number);
          }}
        />
      </InputAdornment>
    </div>
  );
};

export const EventForm = (props: OptionsProps) => {
  // const { element, readonly, onCancel, onConfirm } = props;
  // const controller = useController(EventFormController);
  // const modelRef = useRef(null);
  // const [validateStatus, setValidateStatus] = useState(false);

  // useEffect(() => {
  //   let model = null;
  //   if (hasEventDefinition(element, 'bpmn:ConditionalEventDefinition')) {
  //     model = controller.conditionBoundaryEventModel;
  //   } else if (hasEventDefinition(element, 'bpmn:TimerEventDefinition')) {
  //     model = controller.timerBoundaryEventModel;
  //   } else {
  //     model = controller.startEventModel;
  //   }
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
  //         <FormItem
  //           meta={NodeId}
  //           component={Input}
  //           props={{ readonly }}
  //         ></FormItem>
  //         <FormItem
  //           meta={NodeName}
  //           component={Input}
  //           props={{ readonly }}
  //         ></FormItem>
  //         <FormItem
  //           meta={NodeNameEn}
  //           component={Input}
  //           props={{ readonly }}
  //         ></FormItem>
  //         {hasEventDefinition(element, 'bpmn:ConditionalEventDefinition') ? (
  //           <FormItem
  //             meta={ConditionMeta}
  //             render={(props) => (
  //               <InputText
  //                 {...props}
  //                 className={styles.inputText}
  //                 readonly={readonly}
  //               />
  //             )}
  //           ></FormItem>
  //         ) : null}
  //         {hasEventDefinition(element, 'bpmn:TimerEventDefinition') ? (
  //           <FormItem
  //             meta={BoundaryTimer}
  //             render={({ value, onChange }) => (
  //               <TimerInput
  //                 value={value}
  //                 onChange={onChange}
  //                 readonly={readonly}
  //               />
  //             )}
  //           ></FormItem>
  //         ) : null}
  //       </FormProvider>
  //     </div>
  //     <div className={styles.btnFooter}>
  //       {onCancel && readonly ? (
  //         <Button
  //           theme="default"
  //           className={styles.btn}
  //           onClick={() => onCancel?.()}
  //         >
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

  return <div>Event弹出层</div>;
};

// export default function showEventModal(options: OptionsProps) {
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
//     body: <EventForm {...otherProps} onCancel={onCancelHandler} onConfirm={onConfirmHandler} />,
//     footer: false,
//     onClose: () => {
//       mydialog.hide();
//     },
//   });
//   mydialog.show();
// }
