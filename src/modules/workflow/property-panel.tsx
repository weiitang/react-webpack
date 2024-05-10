/**
 * 属性面板
 */

import { useState, useEffect } from 'react';
import { MessagePlugin } from 'tdesign-react';
import { is$1 } from './custom/bpmn-utils';
import { EventForm } from './modal-event';
import { SequenceFlowForm } from './modal-sequence-flow';
import { TaskForm } from './modal-task';
import { updateProperties } from './custom/node';

export const getPropertyType = (element) => {
  const isSequenceFlow = is$1(element, 'bpmn:SequenceFlow');
  const isStartEvent = is$1(element, 'bpmn:StartEvent');
  const isEndEvent = is$1(element, 'bpmn:EndEvent');
  const isBoundaryEvent = is$1(element, 'bpmn:BoundaryEvent');
  const isUserTask = is$1(element, 'bpmn:UserTask');
  const isSendTask = is$1(element, 'bpmn:SendTask');
  const isReceiveTask = is$1(element, 'bpmn:ReceiveTask');
  const isScriptTask = is$1(element, 'bpmn:ScriptTask');
  const isSubProcess = is$1(element, 'bpmn:SubProcess');

  if (isSequenceFlow) {
    return 'sequenceFlow';
  }
  if (isStartEvent || isEndEvent || isBoundaryEvent) {
    return 'event';
  }
  if (
    isUserTask ||
    isSendTask ||
    isReceiveTask ||
    isScriptTask ||
    isSubProcess
  ) {
    return 'task';
  }
  return null;
};

export const PropertyPanel = (props) => {
  const { modeler, element: initElement, readonly } = props;
  const [type, setType] = useState<any>(null);
  const [element, setElement] = useState(null);

  useEffect(() => {
    const type = getPropertyType(initElement);
    setType(type);
    setElement(initElement);
  }, [initElement]);

  const onConfirm = (model) => {
    const modeling = modeler.get('modeling');
    const moddle = modeler.get('moddle');

    updateProperties({
      element,
      moddle,
      modeling,
      model,
    });

    MessagePlugin.success('已保存');
  };

  // element变更，设置不同的key来避免复用
  // 因为复用时，对应的form会出现一些react hooks报错
  return (
    <>
      {type === 'sequenceFlow' ? (
        <SequenceFlowForm
          element={element}
          key={(element as any)?.businessObject?.id}
          onConfirm={onConfirm}
          readonly={readonly}
        />
      ) : null}
      {type === 'event' ? (
        <EventForm
          element={element}
          key={(element as any).businessObject?.id}
          onConfirm={onConfirm}
          readonly={readonly}
        />
      ) : null}
      {type === 'task' ? (
        <TaskForm
          element={element}
          key={(element as any).businessObject?.id}
          onConfirm={onConfirm}
          readonly={readonly}
        />
      ) : null}
    </>
  );
};
