/* eslint-disable eqeqeq */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/prefer-optional-chain */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/no-this-alias */

import { updateProperties } from './node';
import {
  isUndefined$2,
  isExpanded,
  isDifferentType,
  is$1,
  getBusinessObject,
  isEventSubProcess,
  filter,
  forEach$1,
} from './bpmn-utils';

/**
 * 基于bpmnjs源码修改
 * 控制节点右侧菜单
 */

var START_EVENT = [
  {
    // label: 'Start Event',
    label: '开始事件',
    actionName: 'replace-with-none-start',
    className: 'bpmn-icon-start-event-none',
    target: {
      type: 'bpmn:StartEvent',
    },
  },
  // {
  //   label: 'Intermediate Throw Event',
  //   actionName: 'replace-with-none-intermediate-throwing',
  //   className: 'bpmn-icon-intermediate-event-none',
  //   target: {
  //     type: 'bpmn:IntermediateThrowEvent',
  //   },
  // },
  {
    // label: 'End Event',
    label: '结束事件',
    actionName: 'replace-with-none-end',
    className: 'bpmn-icon-end-event-none',
    target: {
      type: 'bpmn:EndEvent',
    },
  },
  // {
  //   label: 'Message Start Event',
  //   actionName: 'replace-with-message-start',
  //   className: 'bpmn-icon-start-event-message',
  //   target: {
  //     type: 'bpmn:StartEvent',
  //     eventDefinitionType: 'bpmn:MessageEventDefinition',
  //   },
  // },
  // {
  //   label: 'Timer Start Event',
  //   actionName: 'replace-with-timer-start',
  //   className: 'bpmn-icon-start-event-timer',
  //   target: {
  //     type: 'bpmn:StartEvent',
  //     eventDefinitionType: 'bpmn:TimerEventDefinition',
  //   },
  // },
  // {
  //   label: 'Conditional Start Event',
  //   actionName: 'replace-with-conditional-start',
  //   className: 'bpmn-icon-start-event-condition',
  //   target: {
  //     type: 'bpmn:StartEvent',
  //     eventDefinitionType: 'bpmn:ConditionalEventDefinition',
  //   },
  // },
  // {
  //   label: 'Signal Start Event',
  //   actionName: 'replace-with-signal-start',
  //   className: 'bpmn-icon-start-event-signal',
  //   target: {
  //     type: 'bpmn:StartEvent',
  //     eventDefinitionType: 'bpmn:SignalEventDefinition',
  //   },
  // },
];

var END_EVENT = [
  {
    // label: 'Start Event',
    label: '开始事件',
    actionName: 'replace-with-none-start',
    className: 'bpmn-icon-start-event-none',
    target: {
      type: 'bpmn:StartEvent',
    },
  },
  // {
  //   label: 'Intermediate Throw Event',
  //   actionName: 'replace-with-none-intermediate-throw',
  //   className: 'bpmn-icon-intermediate-event-none',
  //   target: {
  //     type: 'bpmn:IntermediateThrowEvent',
  //   },
  // },
  {
    // label: 'End Event',
    label: '结束事件',
    actionName: 'replace-with-none-end',
    className: 'bpmn-icon-end-event-none',
    target: {
      type: 'bpmn:EndEvent',
    },
  },
  // {
  //   label: 'Message End Event',
  //   actionName: 'replace-with-message-end',
  //   className: 'bpmn-icon-end-event-message',
  //   target: {
  //     type: 'bpmn:EndEvent',
  //     eventDefinitionType: 'bpmn:MessageEventDefinition',
  //   },
  // },
  // {
  //   label: 'Escalation End Event',
  //   actionName: 'replace-with-escalation-end',
  //   className: 'bpmn-icon-end-event-escalation',
  //   target: {
  //     type: 'bpmn:EndEvent',
  //     eventDefinitionType: 'bpmn:EscalationEventDefinition',
  //   },
  // },
  // {
  //   label: 'Error End Event',
  //   actionName: 'replace-with-error-end',
  //   className: 'bpmn-icon-end-event-error',
  //   target: {
  //     type: 'bpmn:EndEvent',
  //     eventDefinitionType: 'bpmn:ErrorEventDefinition',
  //   },
  // },
  // {
  //   label: 'Cancel End Event',
  //   actionName: 'replace-with-cancel-end',
  //   className: 'bpmn-icon-end-event-cancel',
  //   target: {
  //     type: 'bpmn:EndEvent',
  //     eventDefinitionType: 'bpmn:CancelEventDefinition',
  //   },
  // },
  // {
  //   label: 'Compensation End Event',
  //   actionName: 'replace-with-compensation-end',
  //   className: 'bpmn-icon-end-event-compensation',
  //   target: {
  //     type: 'bpmn:EndEvent',
  //     eventDefinitionType: 'bpmn:CompensateEventDefinition',
  //   },
  // },
  // {
  //   label: 'Signal End Event',
  //   actionName: 'replace-with-signal-end',
  //   className: 'bpmn-icon-end-event-signal',
  //   target: {
  //     type: 'bpmn:EndEvent',
  //     eventDefinitionType: 'bpmn:SignalEventDefinition',
  //   },
  // },
  // {
  //   label: 'Terminate End Event',
  //   actionName: 'replace-with-terminate-end',
  //   className: 'bpmn-icon-end-event-terminate',
  //   target: {
  //     type: 'bpmn:EndEvent',
  //     eventDefinitionType: 'bpmn:TerminateEventDefinition',
  //   },
  // },
];

var BOUNDARY_EVENT = [
  // {
  //   label: 'Message Boundary Event',
  //   actionName: 'replace-with-message-boundary',
  //   className: 'bpmn-icon-intermediate-event-catch-message',
  //   target: {
  //     type: 'bpmn:BoundaryEvent',
  //     eventDefinitionType: 'bpmn:MessageEventDefinition',
  //   },
  // },
  {
    // label: 'Timer Boundary Event',
    label: '定时器边界事件',
    actionName: 'replace-with-timer-boundary',
    className: 'bpmn-icon-intermediate-event-catch-timer',
    target: {
      type: 'bpmn:BoundaryEvent',
      eventDefinitionType: 'bpmn:TimerEventDefinition',
    },
  },
  // {
  //   label: 'Escalation Boundary Event',
  //   actionName: 'replace-with-escalation-boundary',
  //   className: 'bpmn-icon-intermediate-event-catch-escalation',
  //   target: {
  //     type: 'bpmn:BoundaryEvent',
  //     eventDefinitionType: 'bpmn:EscalationEventDefinition',
  //   },
  // },
  {
    // label: 'Conditional Boundary Event',
    label: '条件边界事件',
    actionName: 'replace-with-conditional-boundary',
    className: 'bpmn-icon-intermediate-event-catch-condition',
    target: {
      type: 'bpmn:BoundaryEvent',
      eventDefinitionType: 'bpmn:ConditionalEventDefinition',
    },
  },
  // {
  //   label: 'Error Boundary Event',
  //   actionName: 'replace-with-error-boundary',
  //   className: 'bpmn-icon-intermediate-event-catch-error',
  //   target: {
  //     type: 'bpmn:BoundaryEvent',
  //     eventDefinitionType: 'bpmn:ErrorEventDefinition',
  //   },
  // },
  // {
  //   label: 'Cancel Boundary Event',
  //   actionName: 'replace-with-cancel-boundary',
  //   className: 'bpmn-icon-intermediate-event-catch-cancel',
  //   target: {
  //     type: 'bpmn:BoundaryEvent',
  //     eventDefinitionType: 'bpmn:CancelEventDefinition',
  //   },
  // },
  // {
  //   label: 'Signal Boundary Event',
  //   actionName: 'replace-with-signal-boundary',
  //   className: 'bpmn-icon-intermediate-event-catch-signal',
  //   target: {
  //     type: 'bpmn:BoundaryEvent',
  //     eventDefinitionType: 'bpmn:SignalEventDefinition',
  //   },
  // },
  // {
  //   label: 'Compensation Boundary Event',
  //   actionName: 'replace-with-compensation-boundary',
  //   className: 'bpmn-icon-intermediate-event-catch-compensation',
  //   target: {
  //     type: 'bpmn:BoundaryEvent',
  //     eventDefinitionType: 'bpmn:CompensateEventDefinition',
  //   },
  // },
  // {
  //   label: 'Message Boundary Event (non-interrupting)',
  //   actionName: 'replace-with-non-interrupting-message-boundary',
  //   className: 'bpmn-icon-intermediate-event-catch-non-interrupting-message',
  //   target: {
  //     type: 'bpmn:BoundaryEvent',
  //     eventDefinitionType: 'bpmn:MessageEventDefinition',
  //     cancelActivity: false,
  //   },
  // },
  {
    // label: 'Timer Boundary Event (non-interrupting)',
    label: '定时器边界事件 (非中断)',
    actionName: 'replace-with-non-interrupting-timer-boundary',
    className: 'bpmn-icon-intermediate-event-catch-non-interrupting-timer',
    target: {
      type: 'bpmn:BoundaryEvent',
      eventDefinitionType: 'bpmn:TimerEventDefinition',
      cancelActivity: false,
    },
  },
  // {
  //   label: 'Escalation Boundary Event (non-interrupting)',
  //   actionName: 'replace-with-non-interrupting-escalation-boundary',
  //   className: 'bpmn-icon-intermediate-event-catch-non-interrupting-escalation',
  //   target: {
  //     type: 'bpmn:BoundaryEvent',
  //     eventDefinitionType: 'bpmn:EscalationEventDefinition',
  //     cancelActivity: false,
  //   },
  // },
  {
    // label: 'Conditional Boundary Event (non-interrupting)',
    label: '条件边界事件 (非中断)',
    actionName: 'replace-with-non-interrupting-conditional-boundary',
    className: 'bpmn-icon-intermediate-event-catch-non-interrupting-condition',
    target: {
      type: 'bpmn:BoundaryEvent',
      eventDefinitionType: 'bpmn:ConditionalEventDefinition',
      cancelActivity: false,
    },
  },
  // {
  //   label: 'Signal Boundary Event (non-interrupting)',
  //   actionName: 'replace-with-non-interrupting-signal-boundary',
  //   className: 'bpmn-icon-intermediate-event-catch-non-interrupting-signal',
  //   target: {
  //     type: 'bpmn:BoundaryEvent',
  //     eventDefinitionType: 'bpmn:SignalEventDefinition',
  //     cancelActivity: false,
  //   },
  // },
];

var START_EVENT_SUB_PROCESS = [
  {
    // label: 'Start Event',
    label: '开始事件',
    actionName: 'replace-with-none-start',
    className: 'bpmn-icon-start-event-none',
    target: {
      type: 'bpmn:StartEvent',
    },
  },
  // {
  //   label: 'Intermediate Throw Event',
  //   actionName: 'replace-with-none-intermediate-throwing',
  //   className: 'bpmn-icon-intermediate-event-none',
  //   target: {
  //     type: 'bpmn:IntermediateThrowEvent',
  //   },
  // },
  {
    // label: 'End Event',
    label: '结束事件',
    actionName: 'replace-with-none-end',
    className: 'bpmn-icon-end-event-none',
    target: {
      type: 'bpmn:EndEvent',
    },
  },
];

var EVENT_SUB_PROCESS_START_EVENT = [
  // {
  //   label: 'Message Start Event',
  //   actionName: 'replace-with-message-start',
  //   className: 'bpmn-icon-start-event-message',
  //   target: {
  //     type: 'bpmn:StartEvent',
  //     eventDefinitionType: 'bpmn:MessageEventDefinition',
  //   },
  // },
  // {
  //   label: 'Timer Start Event',
  //   actionName: 'replace-with-timer-start',
  //   className: 'bpmn-icon-start-event-timer',
  //   target: {
  //     type: 'bpmn:StartEvent',
  //     eventDefinitionType: 'bpmn:TimerEventDefinition',
  //   },
  // },
  // {
  //   label: 'Conditional Start Event',
  //   actionName: 'replace-with-conditional-start',
  //   className: 'bpmn-icon-start-event-condition',
  //   target: {
  //     type: 'bpmn:StartEvent',
  //     eventDefinitionType: 'bpmn:ConditionalEventDefinition',
  //   },
  // },
  // {
  //   label: 'Signal Start Event',
  //   actionName: 'replace-with-signal-start',
  //   className: 'bpmn-icon-start-event-signal',
  //   target: {
  //     type: 'bpmn:StartEvent',
  //     eventDefinitionType: 'bpmn:SignalEventDefinition',
  //   },
  // },
  // {
  //   label: 'Error Start Event',
  //   actionName: 'replace-with-error-start',
  //   className: 'bpmn-icon-start-event-error',
  //   target: {
  //     type: 'bpmn:StartEvent',
  //     eventDefinitionType: 'bpmn:ErrorEventDefinition',
  //   },
  // },
  // {
  //   label: 'Escalation Start Event',
  //   actionName: 'replace-with-escalation-start',
  //   className: 'bpmn-icon-start-event-escalation',
  //   target: {
  //     type: 'bpmn:StartEvent',
  //     eventDefinitionType: 'bpmn:EscalationEventDefinition',
  //   },
  // },
  // {
  //   label: 'Compensation Start Event',
  //   actionName: 'replace-with-compensation-start',
  //   className: 'bpmn-icon-start-event-compensation',
  //   target: {
  //     type: 'bpmn:StartEvent',
  //     eventDefinitionType: 'bpmn:CompensateEventDefinition',
  //   },
  // },
  // {
  //   label: 'Message Start Event (non-interrupting)',
  //   actionName: 'replace-with-non-interrupting-message-start',
  //   className: 'bpmn-icon-start-event-non-interrupting-message',
  //   target: {
  //     type: 'bpmn:StartEvent',
  //     eventDefinitionType: 'bpmn:MessageEventDefinition',
  //     isInterrupting: false,
  //   },
  // },
  // {
  //   label: 'Timer Start Event (non-interrupting)',
  //   actionName: 'replace-with-non-interrupting-timer-start',
  //   className: 'bpmn-icon-start-event-non-interrupting-timer',
  //   target: {
  //     type: 'bpmn:StartEvent',
  //     eventDefinitionType: 'bpmn:TimerEventDefinition',
  //     isInterrupting: false,
  //   },
  // },
  // {
  //   label: 'Conditional Start Event (non-interrupting)',
  //   actionName: 'replace-with-non-interrupting-conditional-start',
  //   className: 'bpmn-icon-start-event-non-interrupting-condition',
  //   target: {
  //     type: 'bpmn:StartEvent',
  //     eventDefinitionType: 'bpmn:ConditionalEventDefinition',
  //     isInterrupting: false,
  //   },
  // },
  // {
  //   label: 'Signal Start Event (non-interrupting)',
  //   actionName: 'replace-with-non-interrupting-signal-start',
  //   className: 'bpmn-icon-start-event-non-interrupting-signal',
  //   target: {
  //     type: 'bpmn:StartEvent',
  //     eventDefinitionType: 'bpmn:SignalEventDefinition',
  //     isInterrupting: false,
  //   },
  // },
  // {
  //   label: 'Escalation Start Event (non-interrupting)',
  //   actionName: 'replace-with-non-interrupting-escalation-start',
  //   className: 'bpmn-icon-start-event-non-interrupting-escalation',
  //   target: {
  //     type: 'bpmn:StartEvent',
  //     eventDefinitionType: 'bpmn:EscalationEventDefinition',
  //     isInterrupting: false,
  //   },
  // },
];

var GATEWAY = [
  {
    // label: 'Exclusive Gateway',
    label: '互斥网关',
    actionName: 'replace-with-exclusive-gateway',
    className: 'bpmn-icon-gateway-xor',
    target: {
      type: 'bpmn:ExclusiveGateway',
    },
  },
  {
    // label: 'Parallel Gateway',
    label: '并行网关',
    actionName: 'replace-with-parallel-gateway',
    className: 'bpmn-icon-gateway-parallel',
    target: {
      type: 'bpmn:ParallelGateway',
    },
  },
  // {
  //   label: 'Inclusive Gateway',
  //   actionName: 'replace-with-inclusive-gateway',
  //   className: 'bpmn-icon-gateway-or',
  //   target: {
  //     type: 'bpmn:InclusiveGateway',
  //   },
  // },
  // {
  //   label: 'Complex Gateway',
  //   actionName: 'replace-with-complex-gateway',
  //   className: 'bpmn-icon-gateway-complex',
  //   target: {
  //     type: 'bpmn:ComplexGateway',
  //   },
  // },
  // {
  //   label: 'Event based Gateway',
  //   actionName: 'replace-with-event-based-gateway',
  //   className: 'bpmn-icon-gateway-eventbased',
  //   target: {
  //     type: 'bpmn:EventBasedGateway',
  //     instantiate: false,
  //     eventGatewayType: 'Exclusive',
  //   },
  // },

  // Gateways deactivated until https://github.com/bpmn-io/bpmn-js/issues/194
  // {
  //   label: 'Event based instantiating Gateway',
  //   actionName: 'replace-with-exclusive-event-based-gateway',
  //   className: 'bpmn-icon-exclusive-event-based',
  //   target: {
  //     type: 'bpmn:EventBasedGateway'
  //   },
  //   options: {
  //     businessObject: { instantiate: true, eventGatewayType: 'Exclusive' }
  //   }
  // },
  // {
  //   label: 'Parallel Event based instantiating Gateway',
  //   actionName: 'replace-with-parallel-event-based-instantiate-gateway',
  //   className: 'bpmn-icon-parallel-event-based-instantiate-gateway',
  //   target: {
  //     type: 'bpmn:EventBasedGateway'
  //   },
  //   options: {
  //     businessObject: { instantiate: true, eventGatewayType: 'Parallel' }
  //   }
  // }
];

var TASK = [
  // {
  //   label: 'Task',
  //   actionName: 'replace-with-task',
  //   className: 'bpmn-icon-task',
  //   target: {
  //     type: 'bpmn:Task',
  //   },
  // },
  {
    // label: 'Send Task',
    label: '发送任务',
    actionName: 'replace-with-send-task',
    className: 'bpmn-icon-send',
    target: {
      type: 'bpmn:SendTask',
    },
  },
  {
    // label: 'Receive Task',
    label: '接收任务',
    actionName: 'replace-with-receive-task',
    className: 'bpmn-icon-receive',
    target: {
      type: 'bpmn:ReceiveTask',
    },
  },
  {
    // label: 'User Task',
    label: '用户任务',
    actionName: 'replace-with-user-task',
    className: 'bpmn-icon-user',
    target: {
      type: 'bpmn:UserTask',
    },
  },
  // {
  //   label: 'Manual Task',
  //   actionName: 'replace-with-manual-task',
  //   className: 'bpmn-icon-manual',
  //   target: {
  //     type: 'bpmn:ManualTask',
  //   },
  // },
  // {
  //   label: 'Business Rule Task',
  //   actionName: 'replace-with-rule-task',
  //   className: 'bpmn-icon-business-rule',
  //   target: {
  //     type: 'bpmn:BusinessRuleTask',
  //   },
  // },
  // {
  //   // label: 'Service Task',
  //   label: '邮件发送任务',
  //   actionName: 'replace-with-service-task',
  //   // className: 'bpmn-icon-service',
  //   className: 'bpmn-icon-send',
  //   target: {
  //     type: 'bpmn:ServiceTask',
  //   },
  //   // 自定义添加的属性
  //   customAttrs: {
  //     'flowable:type': 'mail',
  //   },
  // },
  {
    // label: 'Script Task',
    label: '脚本任务',
    actionName: 'replace-with-script-task',
    className: 'bpmn-icon-script',
    target: {
      type: 'bpmn:ScriptTask',
    },
  },
  // {
  //   label: 'Call Activity',
  //   actionName: 'replace-with-call-activity',
  //   className: 'bpmn-icon-call-activity',
  //   target: {
  //     type: 'bpmn:CallActivity',
  //   },
  // },
  {
    // label: 'Sub Process (collapsed)',
    label: '子流程（折叠）',
    actionName: 'replace-with-collapsed-subprocess',
    className: 'bpmn-icon-subprocess-collapsed',
    target: {
      type: 'bpmn:SubProcess',
      isExpanded: false,
    },
  },
  {
    // label: 'Sub Process (expanded)',
    label: '子流程',
    actionName: 'replace-with-expanded-subprocess',
    className: 'bpmn-icon-subprocess-expanded',
    target: {
      type: 'bpmn:SubProcess',
      isExpanded: true,
    },
  },
];

var SUBPROCESS_EXPANDED = [
  // {
  //   label: 'Transaction',
  //   actionName: 'replace-with-transaction',
  //   className: 'bpmn-icon-transaction',
  //   target: {
  //     type: 'bpmn:Transaction',
  //     isExpanded: true,
  //   },
  // },
  // {
  //   label: 'Event Sub Process',
  //   actionName: 'replace-with-event-subprocess',
  //   className: 'bpmn-icon-event-subprocess-expanded',
  //   target: {
  //     type: 'bpmn:SubProcess',
  //     triggeredByEvent: true,
  //     isExpanded: true,
  //   },
  // },
  {
    // label: 'Sub Process (collapsed)',
    label: '子流程（折叠）',
    actionName: 'replace-with-collapsed-subprocess',
    className: 'bpmn-icon-subprocess-collapsed',
    target: {
      type: 'bpmn:SubProcess',
      isExpanded: false,
    },
  },
];

var DATA_OBJECT_REFERENCE = [
  // {
  //   label: 'Data Store Reference',
  //   actionName: 'replace-with-data-store-reference',
  //   className: 'bpmn-icon-data-store',
  //   target: {
  //     type: 'bpmn:DataStoreReference',
  //   },
  // },
];

var DATA_STORE_REFERENCE = [
  // {
  //   label: 'Data Object Reference',
  //   actionName: 'replace-with-data-object-reference',
  //   className: 'bpmn-icon-data-object',
  //   target: {
  //     type: 'bpmn:DataObjectReference',
  //   },
  // },
];

var INTERMEDIATE_EVENT = [
  // {
  //   label: 'Start Event',
  //   actionName: 'replace-with-none-start',
  //   className: 'bpmn-icon-start-event-none',
  //   target: {
  //     type: 'bpmn:StartEvent',
  //   },
  // },
  // {
  //   label: 'Intermediate Throw Event',
  //   actionName: 'replace-with-none-intermediate-throw',
  //   className: 'bpmn-icon-intermediate-event-none',
  //   target: {
  //     type: 'bpmn:IntermediateThrowEvent',
  //   },
  // },
  // {
  //   label: 'End Event',
  //   actionName: 'replace-with-none-end',
  //   className: 'bpmn-icon-end-event-none',
  //   target: {
  //     type: 'bpmn:EndEvent',
  //   },
  // },
  // {
  //   label: 'Message Intermediate Catch Event',
  //   actionName: 'replace-with-message-intermediate-catch',
  //   className: 'bpmn-icon-intermediate-event-catch-message',
  //   target: {
  //     type: 'bpmn:IntermediateCatchEvent',
  //     eventDefinitionType: 'bpmn:MessageEventDefinition',
  //   },
  // },
  // {
  //   label: 'Message Intermediate Throw Event',
  //   actionName: 'replace-with-message-intermediate-throw',
  //   className: 'bpmn-icon-intermediate-event-throw-message',
  //   target: {
  //     type: 'bpmn:IntermediateThrowEvent',
  //     eventDefinitionType: 'bpmn:MessageEventDefinition',
  //   },
  // },
  // {
  //   label: 'Timer Intermediate Catch Event',
  //   actionName: 'replace-with-timer-intermediate-catch',
  //   className: 'bpmn-icon-intermediate-event-catch-timer',
  //   target: {
  //     type: 'bpmn:IntermediateCatchEvent',
  //     eventDefinitionType: 'bpmn:TimerEventDefinition',
  //   },
  // },
  // {
  //   label: 'Escalation Intermediate Throw Event',
  //   actionName: 'replace-with-escalation-intermediate-throw',
  //   className: 'bpmn-icon-intermediate-event-throw-escalation',
  //   target: {
  //     type: 'bpmn:IntermediateThrowEvent',
  //     eventDefinitionType: 'bpmn:EscalationEventDefinition',
  //   },
  // },
  // {
  //   label: 'Conditional Intermediate Catch Event',
  //   actionName: 'replace-with-conditional-intermediate-catch',
  //   className: 'bpmn-icon-intermediate-event-catch-condition',
  //   target: {
  //     type: 'bpmn:IntermediateCatchEvent',
  //     eventDefinitionType: 'bpmn:ConditionalEventDefinition',
  //   },
  // },
  // {
  //   label: 'Link Intermediate Catch Event',
  //   actionName: 'replace-with-link-intermediate-catch',
  //   className: 'bpmn-icon-intermediate-event-catch-link',
  //   target: {
  //     type: 'bpmn:IntermediateCatchEvent',
  //     eventDefinitionType: 'bpmn:LinkEventDefinition',
  //     eventDefinitionAttrs: {
  //       name: '',
  //     },
  //   },
  // },
  // {
  //   label: 'Link Intermediate Throw Event',
  //   actionName: 'replace-with-link-intermediate-throw',
  //   className: 'bpmn-icon-intermediate-event-throw-link',
  //   target: {
  //     type: 'bpmn:IntermediateThrowEvent',
  //     eventDefinitionType: 'bpmn:LinkEventDefinition',
  //     eventDefinitionAttrs: {
  //       name: '',
  //     },
  //   },
  // },
  // {
  //   label: 'Compensation Intermediate Throw Event',
  //   actionName: 'replace-with-compensation-intermediate-throw',
  //   className: 'bpmn-icon-intermediate-event-throw-compensation',
  //   target: {
  //     type: 'bpmn:IntermediateThrowEvent',
  //     eventDefinitionType: 'bpmn:CompensateEventDefinition',
  //   },
  // },
  // {
  //   label: 'Signal Intermediate Catch Event',
  //   actionName: 'replace-with-signal-intermediate-catch',
  //   className: 'bpmn-icon-intermediate-event-catch-signal',
  //   target: {
  //     type: 'bpmn:IntermediateCatchEvent',
  //     eventDefinitionType: 'bpmn:SignalEventDefinition',
  //   },
  // },
  // {
  //   label: 'Signal Intermediate Throw Event',
  //   actionName: 'replace-with-signal-intermediate-throw',
  //   className: 'bpmn-icon-intermediate-event-throw-signal',
  //   target: {
  //     type: 'bpmn:IntermediateThrowEvent',
  //     eventDefinitionType: 'bpmn:SignalEventDefinition',
  //   },
  // },
];

// 事务子流程
var TRANSACTION = [
  // {
  //   label: 'Sub Process',
  //   actionName: 'replace-with-subprocess',
  //   className: 'bpmn-icon-subprocess-expanded',
  //   target: {
  //     type: 'bpmn:SubProcess',
  //     isExpanded: true,
  //   },
  // },
  // {
  //   label: 'Event Sub Process',
  //   actionName: 'replace-with-event-subprocess',
  //   className: 'bpmn-icon-event-subprocess-expanded',
  //   target: {
  //     type: 'bpmn:SubProcess',
  //     triggeredByEvent: true,
  //     isExpanded: true,
  //   },
  // },
];

// 事件子流程
var EVENT_SUB_PROCESS = [
  // {
  //   label: 'Sub Process',
  //   actionName: 'replace-with-subprocess',
  //   className: 'bpmn-icon-subprocess-expanded',
  //   target: {
  //     type: 'bpmn:SubProcess',
  //     isExpanded: true,
  //   },
  // },
  // {
  //   label: 'Transaction',
  //   actionName: 'replace-with-transaction',
  //   className: 'bpmn-icon-transaction',
  //   target: {
  //     type: 'bpmn:Transaction',
  //     isExpanded: true,
  //   },
  // },
];

var PARTICIPANT = [
  // {
  //   label: 'Expanded Pool',
  //   actionName: 'replace-with-expanded-pool',
  //   className: 'bpmn-icon-participant',
  //   target: {
  //     type: 'bpmn:Participant',
  //     isExpanded: true,
  //   },
  // },
  // {
  //   label(element) {
  //     var label = 'Empty Pool';
  //     if (element.children && element.children.length) {
  //       label += ' (removes content)';
  //     }
  //     return label;
  //   },
  //   actionName: 'replace-with-collapsed-pool',
  //   // TODO(@janstuemmel): maybe design new icon
  //   className: 'bpmn-icon-lane',
  //   target: {
  //     type: 'bpmn:Participant',
  //     isExpanded: false,
  //   },
  // },
];

var SEQUENCE_FLOW = [
  {
    // label: 'Sequence Flow',
    label: '顺序流',
    actionName: 'replace-with-sequence-flow',
    className: 'bpmn-icon-connection',
  },
  {
    // label: 'Default Flow',
    label: '默认流',
    actionName: 'replace-with-default-flow',
    className: 'bpmn-icon-default-flow',
  },
  {
    // label: 'Conditional Flow',
    label: '条件流',
    actionName: 'replace-with-conditional-flow',
    className: 'bpmn-icon-conditional-flow',
  },
];

/**
 * This module is an element agnostic replace menu provider for the popup menu.
 */
export default function ReplaceMenuProvider(
  bpmnFactory,
  popupMenu,
  modeling,
  moddle,
  bpmnReplace,
  rules,
  translate
) {
  this._bpmnFactory = bpmnFactory;
  this._popupMenu = popupMenu;
  this._modeling = modeling;
  this._moddle = moddle;
  this._bpmnReplace = bpmnReplace;
  this._rules = rules;
  this._translate = translate;

  this.register();
}

ReplaceMenuProvider.$inject = [
  'bpmnFactory',
  'popupMenu',
  'modeling',
  'moddle',
  'bpmnReplace',
  'rules',
  'translate',
];

/**
 * Register replace menu provider in the popup menu
 */
ReplaceMenuProvider.prototype.register = function () {
  this._popupMenu.registerProvider('bpmn-replace', this);
};

/**
 * Get all entries from replaceOptions for the given element and apply filters
 * on them. Get for example only elements, which are different from the current one.
 *
 * @param {djs.model.Base} element
 *
 * @return {Array<Object>} a list of menu entry items
 */
ReplaceMenuProvider.prototype.getEntries = function (element) {
  const { businessObject } = element;

  const rules = this._rules;

  let entries;

  if (!rules.allowed('shape.replace', { element })) {
    return [];
  }

  const differentType = isDifferentType(element);

  if (is$1(businessObject, 'bpmn:DataObjectReference')) {
    return this._createEntries(element, DATA_OBJECT_REFERENCE);
  }

  if (
    is$1(businessObject, 'bpmn:DataStoreReference') &&
    !is$1(element.parent, 'bpmn:Collaboration')
  ) {
    return this._createEntries(element, DATA_STORE_REFERENCE);
  }

  // start events outside sub processes
  if (
    is$1(businessObject, 'bpmn:StartEvent') &&
    !is$1(businessObject.$parent, 'bpmn:SubProcess')
  ) {
    entries = filter(START_EVENT, differentType);

    return this._createEntries(element, entries);
  }

  // expanded/collapsed pools
  if (is$1(businessObject, 'bpmn:Participant')) {
    entries = filter(
      PARTICIPANT,
      (entry) => isExpanded(element) !== entry.target.isExpanded
    );

    return this._createEntries(element, entries);
  }

  // start events inside event sub processes
  if (
    is$1(businessObject, 'bpmn:StartEvent') &&
    isEventSubProcess(businessObject.$parent)
  ) {
    entries = filter(EVENT_SUB_PROCESS_START_EVENT, (entry) => {
      const { target } = entry;

      const isInterrupting = target.isInterrupting !== false;

      const isInterruptingEqual =
        getBusinessObject(element).isInterrupting === isInterrupting;

      // filters elements which types and event definition are equal but have have different interrupting types
      return (
        differentType(entry) || (!differentType(entry) && !isInterruptingEqual)
      );
    });

    return this._createEntries(element, entries);
  }

  // start events inside sub processes
  if (
    is$1(businessObject, 'bpmn:StartEvent') &&
    !isEventSubProcess(businessObject.$parent) &&
    is$1(businessObject.$parent, 'bpmn:SubProcess')
  ) {
    entries = filter(START_EVENT_SUB_PROCESS, differentType);

    return this._createEntries(element, entries);
  }

  // end events
  if (is$1(businessObject, 'bpmn:EndEvent')) {
    entries = filter(END_EVENT, (entry) => {
      const { target } = entry;

      // hide cancel end events outside transactions
      if (
        target.eventDefinitionType == 'bpmn:CancelEventDefinition' &&
        !is$1(businessObject.$parent, 'bpmn:Transaction')
      ) {
        return false;
      }

      return differentType(entry);
    });

    return this._createEntries(element, entries);
  }

  // boundary events
  if (is$1(businessObject, 'bpmn:BoundaryEvent')) {
    entries = filter(BOUNDARY_EVENT, (entry) => {
      const { target } = entry;

      if (
        target.eventDefinitionType == 'bpmn:CancelEventDefinition' &&
        !is$1(businessObject.attachedToRef, 'bpmn:Transaction')
      ) {
        return false;
      }
      const cancelActivity = target.cancelActivity !== false;

      const isCancelActivityEqual =
        businessObject.cancelActivity == cancelActivity;

      return (
        differentType(entry) ||
        (!differentType(entry) && !isCancelActivityEqual)
      );
    });

    return this._createEntries(element, entries);
  }

  // intermediate events
  if (
    is$1(businessObject, 'bpmn:IntermediateCatchEvent') ||
    is$1(businessObject, 'bpmn:IntermediateThrowEvent')
  ) {
    entries = filter(INTERMEDIATE_EVENT, differentType);

    return this._createEntries(element, entries);
  }

  // gateways
  if (is$1(businessObject, 'bpmn:Gateway')) {
    entries = filter(GATEWAY, differentType);

    return this._createEntries(element, entries);
  }

  // transactions
  if (is$1(businessObject, 'bpmn:Transaction')) {
    entries = filter(TRANSACTION, differentType);

    return this._createEntries(element, entries);
  }

  // expanded event sub processes
  if (isEventSubProcess(businessObject) && isExpanded(element)) {
    entries = filter(EVENT_SUB_PROCESS, differentType);

    return this._createEntries(element, entries);
  }

  // expanded sub processes
  if (is$1(businessObject, 'bpmn:SubProcess') && isExpanded(element)) {
    entries = filter(SUBPROCESS_EXPANDED, differentType);

    return this._createEntries(element, entries);
  }

  // collapsed ad hoc sub processes
  if (is$1(businessObject, 'bpmn:AdHocSubProcess') && !isExpanded(element)) {
    entries = filter(TASK, (entry) => {
      const { target } = entry;

      const isTargetSubProcess = target.type === 'bpmn:SubProcess';

      const isTargetExpanded = target.isExpanded === true;

      return (
        isDifferentType(element) && (!isTargetSubProcess || isTargetExpanded)
      );
    });

    return this._createEntries(element, entries);
  }

  // sequence flows
  if (is$1(businessObject, 'bpmn:SequenceFlow')) {
    return this._createSequenceFlowEntries(element, SEQUENCE_FLOW);
  }

  // flow nodes
  if (is$1(businessObject, 'bpmn:FlowNode')) {
    entries = filter(TASK, differentType);
    // collapsed SubProcess can not be replaced with itself
    if (is$1(businessObject, 'bpmn:SubProcess') && !isExpanded(element)) {
      // entries = filter(entries, (entry) => entry.label !== 'Sub Process (collapsed)');
      entries = filter(
        entries,
        (entry) =>
          !(
            entry.target?.type === 'bpmn:SubProcess' &&
            entry.target?.isExpanded === false
          )
      );
    }

    return this._createEntries(element, entries);
  }

  return [];
};

/**
 * Get a list of header items for the given element. This includes buttons
 * for multi instance markers and for the ad hoc marker.
 *
 * @param {djs.model.Base} element
 *
 * @return {Array<Object>} a list of menu entry items
 */
ReplaceMenuProvider.prototype.getHeaderEntries = function (element) {
  // 暂时没啥用，关闭
  return [];

  // let headerEntries = [];

  // if (is$1(element, 'bpmn:Activity') && !isEventSubProcess(element)) {
  //   headerEntries = headerEntries.concat(this._getLoopEntries(element));
  // }

  // if (is$1(element, 'bpmn:DataObjectReference')) {
  //   headerEntries = headerEntries.concat(this._getDataObjectIsCollection(element));
  // }

  // if (is$1(element, 'bpmn:Participant')) {
  //   headerEntries = headerEntries.concat(this._getParticipantMultiplicity(element));
  // }

  // if (is$1(element, 'bpmn:SubProcess') && !is$1(element, 'bpmn:Transaction') && !isEventSubProcess(element)) {
  //   headerEntries.push(this._getAdHocEntry(element));
  // }

  // return headerEntries;
};

/**
 * Creates an array of menu entry objects for a given element and filters the replaceOptions
 * according to a filter function.
 *
 * @param  {djs.model.Base} element
 * @param  {Object} replaceOptions
 *
 * @return {Array<Object>} a list of menu items
 */
ReplaceMenuProvider.prototype._createEntries = function (
  element,
  replaceOptions
) {
  const menuEntries = [];

  const self = this;

  forEach$1(replaceOptions, (definition) => {
    // const entry = self._createMenuEntry(definition, element);

    const entry = self._createMenuEntry(definition, element, () => {
      const { replaceElement } = this._bpmnReplace;
      const { target, customAttrs } = definition;
      const shape = replaceElement(element, target);

      // 一些action需要添加自定义属性，如mail
      if (customAttrs) {
        Object.keys(customAttrs).forEach((v) => {
          shape.businessObject.set(v, customAttrs[v]);
        });
      }

      // 移除切换前后不一致的自定义元素
      updateProperties({
        element: shape, // 使用替换后的shape，否则element是变化前的
        moddle: this._moddle,
        modeling: this._modeling,
      });

      return shape;
    });

    menuEntries.push(entry);
  });

  return menuEntries;
};

/**
* Creates an array of menu entry objects for a given sequence flow.
*
* @param  {djs.model.Base} element
* @param  {Object} replaceOptions

* @return {Array<Object>} a list of menu items
*/
ReplaceMenuProvider.prototype._createSequenceFlowEntries = function (
  element,
  replaceOptions
) {
  const businessObject = getBusinessObject(element);

  const menuEntries = [];

  const modeling = this._modeling;
  const moddle = this._moddle;

  const self = this;

  forEach$1(replaceOptions, (entry) => {
    switch (entry.actionName) {
      case 'replace-with-default-flow':
        if (
          businessObject.sourceRef.default !== businessObject &&
          (is$1(businessObject.sourceRef, 'bpmn:ExclusiveGateway') ||
            is$1(businessObject.sourceRef, 'bpmn:InclusiveGateway') ||
            is$1(businessObject.sourceRef, 'bpmn:ComplexGateway') ||
            is$1(businessObject.sourceRef, 'bpmn:Activity'))
        ) {
          menuEntries.push(
            self._createMenuEntry(entry, element, () => {
              modeling.updateProperties(element.source, {
                default: businessObject,
              });
            })
          );
        }
        break;
      case 'replace-with-conditional-flow':
        if (
          !businessObject.conditionExpression &&
          is$1(businessObject.sourceRef, 'bpmn:Activity')
        ) {
          menuEntries.push(
            self._createMenuEntry(entry, element, () => {
              const conditionExpression = moddle.create(
                'bpmn:FormalExpression',
                { body: '' }
              );

              modeling.updateProperties(element, { conditionExpression });
            })
          );
        }
        break;
      default:
        // default flows
        if (
          is$1(businessObject.sourceRef, 'bpmn:Activity') &&
          businessObject.conditionExpression
        ) {
          return menuEntries.push(
            self._createMenuEntry(entry, element, () => {
              modeling.updateProperties(element, {
                conditionExpression: undefined,
              });
            })
          );
        }

        // conditional flows
        if (
          (is$1(businessObject.sourceRef, 'bpmn:ExclusiveGateway') ||
            is$1(businessObject.sourceRef, 'bpmn:InclusiveGateway') ||
            is$1(businessObject.sourceRef, 'bpmn:ComplexGateway') ||
            is$1(businessObject.sourceRef, 'bpmn:Activity')) &&
          businessObject.sourceRef.default === businessObject
        ) {
          return menuEntries.push(
            self._createMenuEntry(entry, element, () => {
              modeling.updateProperties(element.source, { default: undefined });
            })
          );
        }
    }
  });

  return menuEntries;
};

/**
 * Creates and returns a single menu entry item.
 *
 * @param  {Object} definition a single replace options definition object
 * @param  {djs.model.Base} element
 * @param  {Function} [action] an action callback function which gets called when
 *                             the menu entry is being triggered.
 *
 * @return {Object} menu entry item
 */
ReplaceMenuProvider.prototype._createMenuEntry = function (
  definition,
  element,
  action
) {
  const translate = this._translate;
  const { replaceElement } = this._bpmnReplace;

  const replaceAction = function () {
    return replaceElement(element, definition.target);
  };

  let { label } = definition;
  if (label && typeof label === 'function') {
    label = label(element);
  }

  action = action || replaceAction;

  const menuEntry = {
    label: translate(label),
    className: definition.className,
    id: definition.actionName,
    action,
  };

  return menuEntry;
};

/**
 * Get a list of menu items containing buttons for multi instance markers
 *
 * @param  {djs.model.Base} element
 *
 * @return {Array<Object>} a list of menu items
 */
ReplaceMenuProvider.prototype._getLoopEntries = function (element) {
  const self = this;
  const translate = this._translate;

  function toggleLoopEntry(event, entry) {
    let newLoopCharacteristics = getBusinessObject(element).loopCharacteristics;

    if (entry.active) {
      newLoopCharacteristics = undefined;
    } else {
      if (
        isUndefined$2(entry.options.isSequential) ||
        !newLoopCharacteristics ||
        !is$1(newLoopCharacteristics, entry.options.loopCharacteristics)
      ) {
        newLoopCharacteristics = self._moddle.create(
          entry.options.loopCharacteristics
        );
      }

      newLoopCharacteristics.isSequential = entry.options.isSequential;
    }
    self._modeling.updateProperties(element, {
      loopCharacteristics: newLoopCharacteristics,
    });
  }

  const businessObject = getBusinessObject(element);
  const { loopCharacteristics } = businessObject;

  let isSequential;
  let isLoop;
  let isParallel;

  if (loopCharacteristics) {
    isSequential = loopCharacteristics.isSequential;
    isLoop = loopCharacteristics.isSequential === undefined;
    isParallel =
      loopCharacteristics.isSequential !== undefined &&
      !loopCharacteristics.isSequential;
  }

  const loopEntries = [
    {
      id: 'toggle-parallel-mi',
      className: 'bpmn-icon-parallel-mi-marker',
      title: translate('Parallel Multi Instance'),
      active: isParallel,
      action: toggleLoopEntry,
      options: {
        loopCharacteristics: 'bpmn:MultiInstanceLoopCharacteristics',
        isSequential: false,
      },
    },
    {
      id: 'toggle-sequential-mi',
      className: 'bpmn-icon-sequential-mi-marker',
      title: translate('Sequential Multi Instance'),
      active: isSequential,
      action: toggleLoopEntry,
      options: {
        loopCharacteristics: 'bpmn:MultiInstanceLoopCharacteristics',
        isSequential: true,
      },
    },
    {
      id: 'toggle-loop',
      className: 'bpmn-icon-loop-marker',
      title: translate('Loop'),
      active: isLoop,
      action: toggleLoopEntry,
      options: {
        loopCharacteristics: 'bpmn:StandardLoopCharacteristics',
      },
    },
  ];
  return loopEntries;
};

/**
 * Get a list of menu items containing a button for the collection marker
 *
 * @param  {djs.model.Base} element
 *
 * @return {Array<Object>} a list of menu items
 */
ReplaceMenuProvider.prototype._getDataObjectIsCollection = function (element) {
  const self = this;
  const translate = this._translate;

  function toggleIsCollection(event, entry) {
    self._modeling.updateModdleProperties(element, dataObject, {
      isCollection: !entry.active,
    });
  }

  var dataObject = element.businessObject.dataObjectRef;
  const { isCollection } = dataObject;

  const dataObjectEntries = [
    {
      id: 'toggle-is-collection',
      className: 'bpmn-icon-parallel-mi-marker',
      title: translate('Collection'),
      active: isCollection,
      action: toggleIsCollection,
    },
  ];
  return dataObjectEntries;
};

/**
 * Get a list of menu items containing a button for the participant multiplicity marker
 *
 * @param  {djs.model.Base} element
 *
 * @return {Array<Object>} a list of menu items
 */
ReplaceMenuProvider.prototype._getParticipantMultiplicity = function (element) {
  const self = this;
  const bpmnFactory = this._bpmnFactory;
  const translate = this._translate;

  function toggleParticipantMultiplicity(event, entry) {
    const isActive = entry.active;
    let participantMultiplicity;

    if (!isActive) {
      participantMultiplicity = bpmnFactory.create(
        'bpmn:ParticipantMultiplicity'
      );
    }

    self._modeling.updateProperties(element, { participantMultiplicity });
  }

  const { participantMultiplicity } = element.businessObject;

  const participantEntries = [
    {
      id: 'toggle-participant-multiplicity',
      className: 'bpmn-icon-parallel-mi-marker',
      title: translate('Participant Multiplicity'),
      active: !!participantMultiplicity,
      action: toggleParticipantMultiplicity,
    },
  ];
  return participantEntries;
};

/**
 * Get the menu items containing a button for the ad hoc marker
 *
 * @param  {djs.model.Base} element
 *
 * @return {Object} a menu item
 */
ReplaceMenuProvider.prototype._getAdHocEntry = function (element) {
  const translate = this._translate;
  const businessObject = getBusinessObject(element);

  const isAdHoc = is$1(businessObject, 'bpmn:AdHocSubProcess');

  const { replaceElement } = this._bpmnReplace;

  const adHocEntry = {
    id: 'toggle-adhoc',
    className: 'bpmn-icon-ad-hoc-marker',
    title: translate('Ad-hoc'),
    active: isAdHoc,
    action(event, entry) {
      if (isAdHoc) {
        return replaceElement(
          element,
          { type: 'bpmn:SubProcess' },
          {
            autoResize: false,
            layoutConnection: false,
          }
        );
      }
      return replaceElement(
        element,
        { type: 'bpmn:AdHocSubProcess' },
        {
          autoResize: false,
          layoutConnection: false,
        }
      );
    },
  };

  return adHocEntry;
};
