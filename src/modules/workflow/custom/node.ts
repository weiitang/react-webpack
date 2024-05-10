/* eslint-disable no-console */
/* eslint-disable no-param-reassign */
/**
 * 对节点的一些处理
 */

// import {
//   BaseTaskFormModel,
//   ConditionBoundaryEventFormModel,
//   TimerBoundaryEventFormModel,
//   SequenceFlowFormModel,
//   ScriptTaskFormModel,
//   SendTaskFormModel,
//   UserTaskFormModel,
// } from '../models/bpmn.model';
import { unescapeObject, toString } from './utils';
import { is$1, hasEventDefinition } from './bpmn-utils';

interface DataProps {
  id: string;
  name: string;
  [key: string]: any;
}

/**
 * 根据bpmn元素，获取表单数据
 * @param element
 */
export function getFormData(element: any) {
  const { businessObject } = element;
  const data: DataProps = {
    id: unescapeObject(businessObject.id),
    name: unescapeObject(businessObject.name),
  };

  // 边界事件
  const isConditionEvent = hasEventDefinition(
    element,
    'bpmn:ConditionalEventDefinition'
  );
  const isTimerEvent = hasEventDefinition(element, 'bpmn:TimerEventDefinition');
  if (isConditionEvent) {
    Object.assign(data, {
      condition: unescapeObject(
        businessObject.eventDefinitions[0]?.condition?.body
      ),
    });
  } else if (isTimerEvent) {
    Object.assign(data, {
      timeDuration: unescapeObject(
        businessObject.eventDefinitions[0]?.timeDuration?.body
      ),
    });
  }

  // 连线
  const isSequencFlow = is$1(element, 'bpmn:SequenceFlow');
  if (isSequencFlow) {
    Object.assign(data, {
      condition: unescapeObject(businessObject.conditionExpression?.body),
    });
  }

  // 自定义元素
  if (
    businessObject.extensionElements &&
    Array.isArray(businessObject.extensionElements.values)
  ) {
    businessObject.extensionElements.values.forEach((v) => {
      // BpmnModeler与BpmnViewer的实例对象，取出来的v不一样
      // BpmnModeler.$type=flowable:Ma, body=xxx
      // BpmnViewer.$type=flowable:ma, 不存在body属性，存在$body=xxx属性
      //
      // 这里先简单处理，若后续有更多差异需要调整
      if (v.$instanceOf('flowable:Ma') || v.$instanceOf('flowable:ma')) {
        Object.assign(data, {
          [v.name]: unescapeObject(v.body || v.$body),
        });
      }
      // else if (v.$instanceOf('flowable:Field')) {
      //   Object.assign(data, {
      //     [v.name]: v.strings.map((v2) => unescapeObject(v2.body)).join(','),
      //   });
      // }
    });
  }

  // ScriptTask的script为内置属性
  if (businessObject.script) {
    Object.assign(data, {
      script: unescapeObject(businessObject.script),
    });
  }

  return data;
}

/**
 * 更新节点属性
 *
 * model不传时使用element及targetType进行推导
 */
export function updateProperties(args: {
  element: any;
  moddle: any;
  modeling: any;
  model: any;
}) {
  const { element, moddle, modeling, model } = args;
  const { businessObject } = element;

  const isConditionEvent = hasEventDefinition(
    element,
    'bpmn:ConditionalEventDefinition'
  );
  const isTimerEvent = hasEventDefinition(element, 'bpmn:TimerEventDefinition');
  const isSequenceFlow = is$1(element, 'bpmn:SequenceFlow');

  const isUserTask = is$1(element, 'bpmn:UserTask');
  const isSendTask = is$1(element, 'bpmn:SendTask');
  const isReceiveTask = is$1(element, 'bpmn:ReceiveTask');
  const isScriptTask = is$1(element, 'bpmn:ScriptTask');
  const isSubProcess = is$1(element, 'bpmn:SubProcess');

  let myModel: any = null;
  if (model) {
    myModel = model;
  } else {
    const formData = getFormData(element);
    const modelConstructor = function (data) {
      console.log('data', data);
    };
    // @config: 增加类型时修改此处
    // if (isConditionEvent) {
    //   modelConstructor = ConditionBoundaryEventFormModel;
    // } else if (isTimerEvent) {
    //   modelConstructor = TimerBoundaryEventFormModel;
    // } else if (isSequenceFlow) {
    //   modelConstructor = SequenceFlowFormModel;
    // } else if (isUserTask) {
    //   modelConstructor = UserTaskFormModel;
    // } else if (isSendTask) {
    //   modelConstructor = SendTaskFormModel;
    // } else if (isScriptTask) {
    //   modelConstructor = ScriptTaskFormModel;
    // } else if (isReceiveTask || isSubProcess) {
    //   modelConstructor = BaseTaskFormModel;
    // }

    // 这2个是标准的元素，所以切换时会自动处理
    // else if (isBoundaryEvent) {
    //   if (hasEventDefinition(element, 'bpmn:ConditionalEventDefinition')) {
    //     modelConstructor = ConditionBoundaryEventFormModel;
    //   } else if (hasEventDefinition(element, 'bpmn:TimerEventDefinition')) {
    //     modelConstructor = TimerBoundaryEventFormModel;
    //   }
    // }

    // 推导失败不更新
    if (!modelConstructor) {
      return;
    }

    // eslint-disable-next-line new-cap
    myModel = new modelConstructor(formData);
  }

  const data = myModel.toData();

  const properties = {
    id: data.id,
    name: data.name,
  };

  // 自定义元素 https://github.com/bpmn-io/bpmn-js-example-model-extension
  // moddle定义说明 https://github.com/bpmn-io/moddle/blob/master/docs/descriptor.md
  // type=real,表示啥类型都可以
  // 需要先定义导入flowable.json文件,方可识别命名空间

  const extElements = [];

  // 通用自定义属性
  const commonProps = ['nameEn'];
  commonProps.forEach((v) => {
    if (typeof data[v] !== 'undefined' && data[v]) {
      const el: any = moddle.create('flowable:Ma');
      el.name = v;
      el.body = toString(data[v]);
      extElements.push(el as never);
    }
  });

  // 边界事件
  if (isConditionEvent) {
    businessObject.eventDefinitions.forEach((v: any) => {
      v.condition.body = data.condition;
    });
  } else if (isTimerEvent) {
    businessObject.eventDefinitions.forEach((v: any) => {
      const el = moddle.create('bpmn:FormalExpression');
      el.body = `${data.timeDuration}`; // body是个文本类型
      v.timeDuration = el;
    });
  }

  // 连线
  else if (isSequenceFlow) {
    // 有值变没值，移除标签
    if (businessObject.conditionExpression && !data.condition) {
      delete businessObject.conditionExpression;
    } else {
      const conditionExpression = moddle.create('bpmn:FormalExpression', {
        body: data.condition,
      });
      businessObject.conditionExpression = conditionExpression;
    }
  }

  // 任务
  else if (
    isUserTask ||
    isSendTask ||
    isReceiveTask ||
    isScriptTask ||
    isSubProcess
  ) {
    Object.keys(data)
      .filter((v) => !['id', 'name', 'script'].concat(commonProps).includes(v))
      .forEach((v) => {
        const value = toString(data[v]);

        // 自定义元素
        // const isSendTaskElement = $schema[v]?.sendTask;
        // if (isSendTaskElement) {
        //   el = moddle.create('flowable:Field');
        //   el.name = v;

        //   // flowable:string的string类型在bpmnjs里是内部的内向，不能直接定义，这里在输入输出做一下转换
        //   const mailEl = moddle.create('flowable:FieldString');
        //   mailEl.body = value;

        //   el.get('strings').push(mailEl);
        // } else {
        // }

        if (value) {
          const el = moddle.create('flowable:Ma');
          el.name = v;
          el.body = value;
          extElements.push(el as never);
        }
      });

    // if (isSendTask) {
    //   const el = moddle.create('flowable:Ma');
    //   el.name = 'sendType';
    //   el.body = data.sendType;
    //   extensionElements.get('values').push(el);
    // }

    // ScriptTask的script为内置属性
    if (isScriptTask && data.script) {
      Object.assign(properties, {
        script: data.script,
      });
    }
  }

  if (extElements.length > 0) {
    const extensionElements = moddle.create('bpmn:ExtensionElements');
    extElements.forEach((el) => {
      extensionElements.get('values').push(el);
    });

    Object.assign(properties, {
      extensionElements,
    });
  } else {
    Object.assign(properties, {
      extensionElements: undefined,
    });
  }

  modeling.updateProperties(element, properties);
}
