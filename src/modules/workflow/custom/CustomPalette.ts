/* eslint-disable @typescript-eslint/naming-convention */
/**
 * 添加选项板操作
 *
 * 参考bpmn-modeler.development.js
 * Palette
 *  .registerProvider()
 *  .getEntries()
 *
 *
 * PaletteProvider
 *  .getPaletteEntries() 控制palette可以显示的所有选项
 *
 * moddle
 * https://github.com/bpmn-io/moddle/blob/master/docs/descriptor.md
 */
import * as styles from './style.less';
import { trigger } from './eventbus';

export default class CustomPalette {
  static $inject: string[];
  bpmnFactory: any;
  create: any;
  elementFactory: any;
  translate: any;
  handTool: any;
  globalConnect: any;

  constructor(
    bpmnFactory: any,
    create: any,
    elementFactory: any,
    palette: any,
    handTool: any,
    globalConnect: any,
    translate: any
  ) {
    this.bpmnFactory = bpmnFactory;
    this.create = create;
    this.elementFactory = elementFactory;
    this.handTool = handTool;
    this.globalConnect = globalConnect;
    this.translate = translate;

    palette.registerProvider(this);
  }

  // 添加额外的entries
  getPaletteEntries() {
    const { create, elementFactory, globalConnect, translate } = this;

    function getDi(element: any) {
      return element?.di;
    }

    function createAction(
      type: string,
      group: string,
      className: string,
      title: string,
      options?: any, // 配合创建的options，一些属性不一定生效
      properties?: any // 自定义添加的属性
    ) {
      function createListener(event: any) {
        const shape = elementFactory.createShape(
          Object.assign({ type }, options)
        );
        // 扩展元素属性
        // https://forum.bpmn.io/t/create-a-non-non-interrupting-timer/6931
        if (typeof properties === 'object' && properties !== null) {
          Object.keys(properties).forEach((v) => {
            shape.businessObject.set(v, properties[v]);
          });
        }

        if (options) {
          const di = getDi(shape);
          di.isExpanded = options.isExpanded;
        }

        create.start(event, shape);
      }

      const shortType = type.replace(/^bpmn:/, '');

      return {
        group,
        className,
        title: title || translate('Create {type}', { type: shortType }),
        action: {
          dragstart: createListener,
          click: createListener,
        },
      };
    }

    function createCustomAction(
      group: string,
      className: string,
      title: string,
      handler: () => void
    ) {
      return {
        group,
        className,
        title,
        action: {
          click: handler,
        },
      };
    }

    // function createTask(suitabilityScore: any) {
    //   return function (event: any) {
    //     // 自定义BPMN节点及属性
    //     const businessObject = bpmnFactory.create('bpmn:Task');
    //     businessObject.suitable = suitabilityScore;

    //     // 创建shape
    //     const shape = elementFactory.createShape({
    //       type: 'bpmn:Task',
    //       businessObject,
    //     });

    //     // event = PointerEvent / DragEvent
    //     create.start(event, shape);
    //   };
    // }

    return {
      // 连线
      'global-connect-tool': {
        group: 'tool',
        className: 'bpmn-icon-connection-multi',
        title: translate('连线'),
        action: {
          click(event: any) {
            globalConnect.start(event);
          },
        },
      },
      'tool-separator-tool': {
        group: 'tool',
        separator: true,
      },
      // 启动事件
      'create.start-event': createAction(
        'bpmn:StartEvent',
        'event',
        'bpmn-icon-start-event-none',
        translate('启动事件')
      ),
      // 结束事件
      'create.end-event': createAction(
        'bpmn:EndEvent',
        'event',
        'bpmn-icon-end-event-none',
        translate('结束事件')
      ),
      // 边界条件事件
      'create.condition-event': createAction(
        'bpmn:BoundaryEvent',
        'event',
        'bpmn-icon-intermediate-event-catch-condition',
        translate('条件边界事件'),
        {
          eventDefinitionType: 'bpmn:ConditionalEventDefinition',
        },
        {
          cancelActivity: true,
        }
      ),
      // 边界条件事件 (非中断)
      'create.non-interrupting-condition-event': createAction(
        'bpmn:BoundaryEvent',
        'event',
        'bpmn-icon-intermediate-event-catch-non-interrupting-condition',
        translate('条件边界事件 (非中断)'),
        {
          eventDefinitionType: 'bpmn:ConditionalEventDefinition',
        },
        {
          cancelActivity: false,
        }
      ),
      // 定时器边界事件
      'create.timer-event': createAction(
        'bpmn:BoundaryEvent',
        'event',
        'bpmn-icon-intermediate-event-catch-timer',
        translate('定时器边界事件'),
        {
          eventDefinitionType: 'bpmn:TimerEventDefinition',
        },
        {
          cancelActivity: true,
        }
      ),
      // 定时器边界事件（非中断）
      'create.non-interrupting-timer-event': createAction(
        'bpmn:BoundaryEvent',
        'event',
        'bpmn-icon-intermediate-event-catch-non-interrupting-timer',
        translate('定时器边界事件（非中断）'),
        {
          eventDefinitionType: 'bpmn:TimerEventDefinition',
        },
        {
          cancelActivity: false,
        }
      ),
      'tool-separator-event': {
        group: 'event',
        separator: true,
      },
      // 并行网关
      'create.parallel-gateway': createAction(
        'bpmn:ParallelGateway',
        'gateway',
        'bpmn-icon-gateway-parallel',
        translate('并行网关')
      ),
      // 互斥网关
      'create.exclusive-gateway': createAction(
        'bpmn:ExclusiveGateway',
        'gateway',
        'bpmn-icon-gateway-xor',
        translate('互斥网关')
      ),
      'tool-separator-gateway': {
        group: 'gateway',
        separator: true,
      },
      // 发送任务
      'create.send-task': createAction(
        'bpmn:SendTask',
        'activity',
        'bpmn-icon-send-task',
        translate('发送任务')
      ),
      // 接收任务
      'create.receive-task': createAction(
        'bpmn:ReceiveTask',
        'activity',
        'bpmn-icon-receive-task',
        translate('接收任务')
      ),
      // 'create.service-task': createAction(
      //   'bpmn:ServiceTask',
      //   'activity',
      //   'bpmn-icon-send-task',
      //   translate('邮件发送任务'),
      //   {},
      //   {
      //     'flowable:type': 'mail',
      //   },
      // ),
      // 用户任务
      'create.user-task': createAction(
        'bpmn:UserTask',
        'activity',
        'bpmn-icon-user-task',
        translate('用户任务'),
        {
          // width: 200,
          // height: 96,
        }
      ),
      // 脚本任务
      'create.script-task': createAction(
        'bpmn:ScriptTask',
        'activity',
        'bpmn-icon-script-task',
        translate('脚本任务')
      ),
      // 子流程
      'create.sub-process': createAction(
        'bpmn:SubProcess',
        'activity',
        'bpmn-icon-subprocess-expanded',
        translate('子流程'),
        {
          isExpanded: true,
        }
      ),
      // 子流程
      'create.sub-process-collapsed': createAction(
        'bpmn:SubProcess',
        'activity',
        'bpmn-icon-subprocess-collapsed',
        translate('子流程（折叠）'),
        {
          isExpanded: false,
        }
      ),
      'tool-separator-import': {
        group: 'activity',
        separator: true,
      },
      // 导入
      'create.import-file': createCustomAction(
        'activity',
        styles.iconFolderOpen,
        translate('导入'),
        () => {
          trigger('workflow.importFile');
        }
      ),
      // 导入
      'create.download-file': createCustomAction(
        'activity',
        styles.iconDownload,
        translate('下载'),
        () => {
          trigger('workflow.downloadFile');
        }
      ),
    };
  }
}

CustomPalette.$inject = [
  'bpmnFactory',
  'create',
  'elementFactory',
  'palette',
  'handTool',
  'globalConnect',
  'translate',
];
