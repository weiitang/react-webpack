/* eslint-disable no-param-reassign */
/**
 * 事件渲染
 */
import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer';
import { is, getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

const HIGH_PRIORITY = 1510;

export default class EventRenderer extends BaseRenderer {
  bpmnRenderer: any;
  static $inject: string[];

  constructor(eventBus: any, bpmnRenderer: any) {
    super(eventBus, HIGH_PRIORITY);
    this.bpmnRenderer = bpmnRenderer;
  }

  canRender(element: any) {
    // if (element.labelTarget) {
    //   return false;
    // }
    return is(element, 'bpmn:StartEvent') || is(element, 'bpmn:EndEvent');
  }

  drawShape(parentNode: any, element: any, attrs: any) {
    const shape = this.bpmnRenderer.drawShape(parentNode, element, attrs);
    const businessObject = getBusinessObject(element);

    // 没有name时才居中，有name可以自己调整位置
    if (!businessObject.name) {
      businessObject.name = is(element, 'bpmn:StartEvent') ? '开始' : '结束';
    }

    // <bpmn:startEvent id="StartEvent_110ttkd" name="Event Label" />
    // 会根据name自动创建一个lable来渲染
    //
    // 这里让label居中，即使label可拖拽，最终经过这里渲染后还是会居中
    // const { labelTarget } = element;
    // if (labelTarget && !element._inited) {
    //   const { width: elWidth, height: elHeight } = element;
    //   const { x, y, width, height } = labelTarget;
    //   const centerX = x + width / 2 - elWidth / 2;
    //   const centerY = y + height / 2 - elHeight / 2;
    //   element.x = centerX;
    //   element.y = centerY;

    //   element._inited = true; // 首次居中，后续可以拖拽
    // }

    // const text = svgCreate('text');
    // svgAttr(text, {
    //   fill: '#000',
    //   transform: 'translate(-15, 5)',
    // });
    // text.textContent = is(element, 'bpmn:StartEvent') ? '开始' : '结束';
    // svgAppend(parentNode, text);

    return shape;
  }
}

EventRenderer.$inject = ['eventBus', 'bpmnRenderer'];
