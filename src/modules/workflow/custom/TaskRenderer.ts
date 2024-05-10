/* eslint-disable no-param-reassign */
/**
 * Task渲染
 */
import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer';
import { attr as svgAttr } from 'tiny-svg';
import { is } from 'bpmn-js/lib/util/ModelUtil';
import { getRoundRectPath } from 'bpmn-js/lib/draw/BpmnRenderUtil';

const HIGH_PRIORITY = 1520;
const BORDER_RADIUS = 3;
const ELEMENT_WIDTH = 200;
const ELEMENT_HEIGHT = 96;

export default class TaskRenderer extends BaseRenderer {
  bpmnRenderer: any;
  static $inject: string[];

  constructor(eventBus: any, bpmnRenderer: any) {
    super(eventBus, HIGH_PRIORITY);
    this.bpmnRenderer = bpmnRenderer;
  }

  canRender(element: any) {
    return is(element, 'bpmn:UserTask');
  }

  drawShape(parentNode: any, element: any, attrs: any) {
    const shape = this.bpmnRenderer.drawShape(parentNode, element, attrs);
    svgAttr(shape, {
      width: ELEMENT_WIDTH,
      height: ELEMENT_HEIGHT,
      rx: BORDER_RADIUS,
      ry: BORDER_RADIUS,
      stroke: '#ECF2FE',
      fill: '#ECF2FE',
    });

    return shape;
  }

  getShapePath(shape: any) {
    if (is(shape, 'bpmn:UserTask')) {
      return getRoundRectPath(shape, BORDER_RADIUS);
    }

    return this.bpmnRenderer.getShapePath(shape);
  }
}

TaskRenderer.$inject = ['eventBus', 'bpmnRenderer'];
