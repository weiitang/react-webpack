/* eslint-disable no-nested-ternary */
/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/naming-convention */
/**
 * 自定义右键菜单
 * 基于bpmnjs源码修改
 */
// import showEventModal from '../modal-event';
// import showSequenceFlowModal from '../modal-sequence-flow';
// import showTaskModal from '../modal-task';
// import { unescapeObject } from './utils';
// import { updateProperties } from './node';
// import * as styles from './style.less';
import {
  assign,
  hasPrimaryModifier,
  isAny,
  is$1,
  isArray$4,
  isEventType,
  isEventSubProcess,
} from './bpmn-utils';

export default function ContextPadProvider(
  config,
  injector,
  eventBus,
  contextPad,
  modeling,
  elementFactory,
  connect,
  create,
  popupMenu,
  canvas,
  rules,
  translate,
  moddle
) {
  config = config || {};

  contextPad.registerProvider(this);

  this._contextPad = contextPad;
  this._modeling = modeling;
  this._elementFactory = elementFactory;
  this._connect = connect;
  this._create = create;
  this._popupMenu = popupMenu;
  this._canvas = canvas;
  this._rules = rules;
  this._translate = translate;

  this._moddle = moddle;

  if (config.autoPlace !== false) {
    this._autoPlace = injector.get('autoPlace', false);
  }

  eventBus.on('create.end', 250, (event) => {
    const { context } = event;
    const { shape } = context;

    if (!hasPrimaryModifier(event) || !contextPad.isOpen(shape)) {
      return;
    }

    const entries = contextPad.getEntries(shape);

    if (entries.replace) {
      entries.replace.action.click(event, shape);
    }
  });
}

ContextPadProvider.$inject = [
  'config.contextPad',
  'injector',
  'eventBus',
  'contextPad',
  'modeling',
  'elementFactory',
  'connect',
  'create',
  'popupMenu',
  'canvas',
  'rules',
  'translate',
  'moddle',
];

ContextPadProvider.prototype.getContextPadEntries = function (element) {
  const contextPad = this._contextPad;
  const modeling = this._modeling;
  // const moddle = this._moddle;
  const elementFactory = this._elementFactory;
  const connect = this._connect;
  const create = this._create;
  const popupMenu = this._popupMenu;
  const canvas = this._canvas;
  const rules = this._rules;
  const autoPlace = this._autoPlace;
  const translate = this._translate;

  const actions = {};

  if (element.type === 'label') {
    return actions;
  }

  const { businessObject } = element;

  function startConnect(event, element) {
    connect.start(event, element);
  }

  function removeElement() {
    modeling.removeElements([element]);
  }

  function getReplaceMenuPosition(element) {
    const Y_OFFSET = 5;

    const diagramContainer = canvas.getContainer();
    const pad = contextPad.getPad(element).html;

    const diagramRect = diagramContainer.getBoundingClientRect();
    const padRect = pad.getBoundingClientRect();

    const top = padRect.top - diagramRect.top;
    const left = padRect.left - diagramRect.left;

    const pos = {
      x: left,
      y: top + padRect.height + Y_OFFSET,
    };

    return pos;
  }

  /**
   * Create an append action
   *
   * @param {string} type
   * @param {string} className
   * @param {string} [title]
   * @param {Object} [options]
   *
   * @return {Object} descriptor
   */
  function appendAction(group, type, className, title, options, properties) {
    if (typeof title !== 'string') {
      options = title;
      title = translate('Append {type}', { type: type.replace(/^bpmn:/, '') });
    }

    function appendStart(event, element) {
      const shape = elementFactory.createShape(assign({ type }, options));

      // 扩展元素属性
      // https://forum.bpmn.io/t/create-a-non-non-interrupting-timer/6931
      if (typeof properties === 'object' && properties !== null) {
        Object.keys(properties).forEach((v) => {
          shape.businessObject.set(v, properties[v]);
        });
      }

      create.start(event, shape, {
        source: element,
      });
    }

    const append = autoPlace
      ? function (event, element) {
          const shape = elementFactory.createShape(assign({ type }, options));

          // 扩展元素属性
          // https://forum.bpmn.io/t/create-a-non-non-interrupting-timer/6931
          if (typeof properties === 'object' && properties !== null) {
            Object.keys(properties).forEach((v) => {
              shape.businessObject.set(v, properties[v]);
            });
          }

          autoPlace.append(element, shape);
        }
      : appendStart;

    return {
      group: group || 'model',
      className,
      title,
      action: {
        dragstart: appendStart,
        click: append,
      },
    };
  }

  // function splitLaneHandler(count) {
  //   return function (event, element) {
  //     // actual split
  //     modeling.splitLane(element, count);

  //     // refresh context pad after split to
  //     // get rid of split icons
  //     contextPad.open(element, true);
  //   };
  // }

  // Lang：道
  // Pool：池
  // Participant: 参与者
  // 泳道相关，暂不支持
  // if (isAny(businessObject, ['bpmn:Lane', 'bpmn:Participant']) && isExpanded(element)) {
  //   const childLanes = getChildLanes(element);

  //   assign(actions, {
  //     'lane-insert-above': {
  //       group: 'lane-insert-above',
  //       className: 'bpmn-icon-lane-insert-above',
  //       // title: translate('Add Lane above'),
  //       title: translate('Add Lane above'),
  //       action: {
  //         click(event, element) {
  //           modeling.addLane(element, 'top');
  //         },
  //       },
  //     },
  //   });

  //   if (childLanes.length < 2) {
  //     if (element.height >= 120) {
  //       assign(actions, {
  //         'lane-divide-two': {
  //           group: 'lane-divide',
  //           className: 'bpmn-icon-lane-divide-two',
  //           title: translate('Divide into two Lanes'),
  //           action: {
  //             click: splitLaneHandler(2),
  //           },
  //         },
  //       });
  //     }

  //     if (element.height >= 180) {
  //       assign(actions, {
  //         'lane-divide-three': {
  //           group: 'lane-divide',
  //           className: 'bpmn-icon-lane-divide-three',
  //           title: translate('Divide into three Lanes'),
  //           action: {
  //             click: splitLaneHandler(3),
  //           },
  //         },
  //       });
  //     }
  //   }

  //   assign(actions, {
  //     'lane-insert-below': {
  //       group: 'lane-insert-below',
  //       className: 'bpmn-icon-lane-insert-below',
  //       title: translate('Add Lane below'),
  //       action: {
  //         click(event, element) {
  //           modeling.addLane(element, 'bottom');
  //         },
  //       },
  //     },
  //   });
  // }

  // @config 给连线添加设置
  // const isSequenceFlow = is$1(element, 'bpmn:SequenceFlow');
  // if (isSequenceFlow) {
  //   assign(actions, {
  //     'append.setting': {
  //       group: 'setting',
  //       className: styles.iconSetting,
  //       title: translate('设置'),
  //       action: {
  //         click: () => {
  //           showSequenceFlowModal({
  //             title: unescapeObject(businessObject.name),
  //             element,
  //             onConfirm(model) {
  //               updateProperties({
  //                 element,
  //                 moddle,
  //                 modeling,
  //                 model,
  //               });
  //             },
  //           });
  //         },
  //       },
  //     },
  //   });
  // }

  // 存在incoming、outgoing、lanes才是bpmn:FlowNode
  // 所以bpmn:SequenceFlow不符合
  if (is$1(businessObject, 'bpmn:FlowNode')) {
    // 暂不支持EventBasedGateway
    // if (is$1(businessObject, 'bpmn:EventBasedGateway')) {
    //   assign(actions, {
    //     'append.receive-task': appendAction(
    //       'bpmn:ReceiveTask',
    //       'bpmn-icon-receive-task',
    //       // translate('Append ReceiveTask'),
    //       translate('添加邮件接收任务'),
    //     ),
    //     'append.message-intermediate-event': appendAction(
    //       'bpmn:IntermediateCatchEvent',
    //       'bpmn-icon-intermediate-event-catch-message',
    //       // translate('Append MessageIntermediateCatchEvent'),
    //       translate('添加消息捕获中间事件'),
    //       { eventDefinitionType: 'bpmn:MessageEventDefinition' },
    //     ),
    //     'append.timer-intermediate-event': appendAction(
    //       'bpmn:IntermediateCatchEvent',
    //       'bpmn-icon-intermediate-event-catch-timer',
    //       // translate('Append TimerIntermediateCatchEvent'),
    //       translate('添加定时器捕获中间事件'),
    //       { eventDefinitionType: 'bpmn:TimerEventDefinition' },
    //     ),
    //     'append.condition-intermediate-event': appendAction(
    //       'bpmn:IntermediateCatchEvent',
    //       'bpmn-icon-intermediate-event-catch-condition',
    //       // translate('Append ConditionIntermediateCatchEvent'),
    //       translate('添加条件捕获中间事件'),
    //       { eventDefinitionType: 'bpmn:ConditionalEventDefinition' },
    //     ),
    //     'append.signal-intermediate-event': appendAction(
    //       'bpmn:IntermediateCatchEvent',
    //       'bpmn-icon-intermediate-event-catch-signal',
    //       // translate('Append SignalIntermediateCatchEvent'),
    //       translate('添加信号捕获中间事件'),
    //       { eventDefinitionType: 'bpmn:SignalEventDefinition' },
    //     ),
    //   });
    // }

    // @config 自定义设置按钮
    // const isStartEvent = is$1(element, 'bpmn:StartEvent');
    // const isEndEvent = is$1(element, 'bpmn:EndEvent');
    // const isBoundaryEvent = is$1(element, 'bpmn:BoundaryEvent');
    // const isUserTask = is$1(element, 'bpmn:UserTask');
    // const isSendTask = is$1(element, 'bpmn:SendTask');
    // const isReceiveTask = is$1(element, 'bpmn:ReceiveTask');
    // const isScriptTask = is$1(element, 'bpmn:ScriptTask');
    // const isSubProcess = is$1(element, 'bpmn:SubProcess');

    // if (
    //   isStartEvent ||
    //   isEndEvent ||
    //   isBoundaryEvent ||
    //   isUserTask ||
    //   isSendTask ||
    //   isReceiveTask ||
    //   isScriptTask ||
    //   isSubProcess
    // ) {
    //   assign(actions, {
    //     'append.setting': {
    //       group: 'setting',
    //       className: styles.iconSetting,
    //       title: translate('设置'),
    //       action: {
    //         click: () => {
    //           if (isStartEvent || isEndEvent || isBoundaryEvent) {
    //             showEventModal({
    //               title: unescapeObject(businessObject.name),
    //               element,
    //               onConfirm(model) {
    //                 updateProperties({
    //                   element,
    //                   moddle,
    //                   modeling,
    //                   model,
    //                 });
    //               },
    //             });
    //           } else if (isUserTask || isSendTask || isReceiveTask || isScriptTask || isSubProcess) {
    //             showTaskModal({
    //               title: unescapeObject(businessObject.name),
    //               element,
    //               onConfirm(model) {
    //                 updateProperties({
    //                   element,
    //                   moddle,
    //                   modeling,
    //                   model,
    //                 });
    //               },
    //             });
    //           }
    //         },
    //       },
    //     },
    //   });
    // }

    if (
      isEventType(
        businessObject,
        'bpmn:BoundaryEvent',
        'bpmn:CompensateEventDefinition'
      )
    ) {
      // 目前走不到这里
      assign(actions, {
        'append.compensation-activity': appendAction(
          'model',
          'bpmn:Task',
          'bpmn-icon-task',
          // translate('Append compensation activity'),
          translate('添加补偿活动'),
          {
            isForCompensation: true,
          }
        ),
      });
    } else if (
      !is$1(businessObject, 'bpmn:EndEvent') &&
      !businessObject.isForCompensation &&
      !isEventType(
        businessObject,
        'bpmn:IntermediateThrowEvent',
        'bpmn:LinkEventDefinition'
      ) &&
      !isEventSubProcess(businessObject)
    ) {
      // 开始事件、网关、任务
      assign(actions, {
        'append.end-event': appendAction(
          'event',
          'bpmn:EndEvent',
          'bpmn-icon-end-event-none',
          // translate('Append EndEvent'),
          translate('添加结束事件')
        ),
        'append.interrupting-condition-event': appendAction(
          'event',
          'bpmn:BoundaryEvent',
          'bpmn-icon-intermediate-event-catch-condition',
          // translate('Append Intermediate/Boundary Event'),
          translate('添加条件边界事件'),
          {
            eventDefinitionType: 'bpmn:ConditionalEventDefinition',
          },
          {
            cancelActivity: true,
          }
        ),
        'append.non-interrupting-condition-event': appendAction(
          'event',
          'bpmn:BoundaryEvent',
          'bpmn-icon-intermediate-event-catch-non-interrupting-condition',
          // translate('Append Intermediate/Boundary Event'),
          translate('添加条件边界事件（非中断）'),
          {
            eventDefinitionType: 'bpmn:ConditionalEventDefinition',
          },
          {
            cancelActivity: false,
          }
        ),
        'append.timer-event': appendAction(
          'event',
          'bpmn:BoundaryEvent',
          'bpmn-icon-intermediate-event-catch-timer',
          // translate('Append Intermediate/Boundary Event'),
          translate('定时器边界事件'),
          {
            eventDefinitionType: 'bpmn:TimerEventDefinition',
          },
          {
            cancelActivity: true,
          }
        ),
        'append.non-interrupting-timer-event': appendAction(
          'event',
          'bpmn:BoundaryEvent',
          'bpmn-icon-intermediate-event-catch-non-interrupting-timer',
          // translate('Append Intermediate/Boundary Event'),
          translate('定时器边界事件（非中断）'),
          {
            eventDefinitionType: 'bpmn:TimerEventDefinition',
          },
          {
            cancelActivity: false,
          }
        ),
        'append.exclusive-gateway': appendAction(
          'gateway',
          'bpmn:ExclusiveGateway',
          'bpmn-icon-gateway-xor',
          // translate('Append Gateway'),
          translate('添加互斥网关')
        ),
        'append.parallel-gateway': appendAction(
          'gateway',
          'bpmn:ParallelGateway',
          'bpmn-icon-gateway-parallel',
          // translate('Append Gateway'),
          translate('添加并行网关')
        ),
        // 'append.append-task': appendAction(
        //   'bpmn:Task',
        //   'bpmn-icon-task',
        //   // translate('Append Task'),
        //   translate('添加任务'),
        // ),
        'append.append-send-task': appendAction(
          'task',
          'bpmn:SendTask',
          'bpmn-icon-send-task',
          // translate('Append Task'),
          translate('添加发送任务')
        ),
        'append.append-receive-task': appendAction(
          'task',
          'bpmn:ReceiveTask',
          'bpmn-icon-receive-task',
          // translate('Append Task'),
          translate('添加接收任务')
        ),
        'append.append-user-task': appendAction(
          'task',
          'bpmn:UserTask',
          'bpmn-icon-user-task',
          // translate('Append Task'),
          translate('添加用户任务')
        ),
        // 'append.append-send-task': appendAction(
        //   'task',
        //   'bpmn:ServiceTask',
        //   'bpmn-icon-send-task',
        //   // translate('Append Task'),
        //   translate('添加邮件发送任务'),
        //   {},
        //   {
        //     'flowable:type': 'mail',
        //   },
        // ),
        'append.append-script-task': appendAction(
          'task',
          'bpmn:ScriptTask',
          'bpmn-icon-script-task',
          // translate('Append Task'),
          translate('添加脚本任务')
        ),
        // 'append.intermediate-event': appendAction(
        //   'bpmn:IntermediateThrowEvent',
        //   'bpmn-icon-intermediate-event-none',
        //   // translate('Append Intermediate/Boundary Event'),
        //   translate('添加中间/边界事件'),
        // ),

        'append.sub-process': appendAction(
          'process',
          'bpmn:SubProcess',
          'bpmn-icon-subprocess-expanded',
          translate('添加子流程'),
          {
            isExpanded: true,
          }
        ),
        'append.sub-process-collapsed': appendAction(
          'process',
          'bpmn:SubProcess',
          'bpmn-icon-subprocess-collapsed',
          translate('添加子流程（折叠）'),
          {
            isExpanded: false,
          }
        ),
      });
    }
  }

  // 添加注释
  if (
    isAny(businessObject, [
      'bpmn:FlowNode',
      'bpmn:InteractionNode',
      'bpmn:DataObjectReference',
      'bpmn:DataStoreReference',
    ])
  ) {
    assign(actions, {
      'append.text-annotation': appendAction(
        'connect',
        'bpmn:TextAnnotation',
        'bpmn-icon-text-annotation',
        '添加注释'
      ),

      connect: {
        group: 'connect',
        className: 'bpmn-icon-connection-multi',
        title: translate(
          // `Connect using ${businessObject.isForCompensation ? '' : 'Sequence/MessageFlow or '}Association`,
          `通过顺序流/信息流或关联进行连接`
        ),
        action: {
          click: startConnect,
          dragstart: startConnect,
        },
      },
    });
  }

  // 注释可以连线
  if (is$1(businessObject, 'bpmn:TextAnnotation')) {
    assign(actions, {
      connect: {
        group: 'connect',
        className: 'bpmn-icon-connection-multi',
        // title: translate('Connect using Association'),
        title: translate('通过关联进行连接'),
        action: {
          click: startConnect,
          dragstart: startConnect,
        },
      },
    });
  }

  // 暂不开放
  // if (isAny(businessObject, ['bpmn:DataObjectReference', 'bpmn:DataStoreReference'])) {
  //   assign(actions, {
  //     connect: {
  //       group: 'connect',
  //       className: 'bpmn-icon-connection-multi',
  //       title: translate('Connect using DataInputAssociation'),
  //       action: {
  //         click: startConnect,
  //         dragstart: startConnect,
  //       },
  //     },
  //   });
  // }

  // 暂不支持分组
  // if (is$1(businessObject, 'bpmn:Group')) {
  //   assign(actions, {
  //     'append.text-annotation': appendAction('bpmn:TextAnnotation', 'bpmn-icon-text-annotation'),
  //   });
  // }

  // 替换类型
  if (!popupMenu.isEmpty(element, 'bpmn-replace')) {
    // Replace menu entry
    assign(actions, {
      replace: {
        group: 'edit',
        className: 'bpmn-icon-screw-wrench',
        // title: translate('Change Type'),
        title: translate('修改类型'),
        action: {
          click(event, element) {
            const position = assign(getReplaceMenuPosition(element), {
              cursor: { x: event.x, y: event.y },
            });

            popupMenu.open(element, 'bpmn-replace', position);
          },
        },
      },
    });
  }

  // delete element entry, only show if allowed by rules
  let deleteAllowed = rules.allowed('elements.delete', { elements: [element] });

  if (isArray$4(deleteAllowed)) {
    // was the element returned as a deletion candidate?
    deleteAllowed = deleteAllowed[0] === element;
  }

  if (deleteAllowed) {
    assign(actions, {
      delete: {
        group: 'edit',
        className: 'bpmn-icon-trash',
        // title: translate('Remove'),
        title: translate('移除'),
        action: {
          click: removeElement,
        },
      },
    });
  }

  return actions;
};
