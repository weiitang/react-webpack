import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer';
import {
  append as svgAppend,
  attr as svgAttr,
  classes as svgClasses,
  create as svgCreate,
} from 'tiny-svg';
import { getRoundRectPath } from 'bpmn-js/lib/draw/BpmnRenderUtil';
import { is, getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { isNil } from 'min-dash';

const HIGH_PRIORITY = 1500; // 默认1000，大于才会render
const TASK_BORDER_RADIUS = 2;
const COLOR_GREEN = '#52B415';
const COLOR_YELLOW = '#ffc800';
const COLOR_RED = '#cc0000';

export default class CustomRenderer extends BaseRenderer {
  bpmnRenderer: any;
  static $inject: string[];

  constructor(eventBus: any, bpmnRenderer: any) {
    super(eventBus, HIGH_PRIORITY);

    this.bpmnRenderer = bpmnRenderer;
  }

  canRender(element: any) {
    // ignore labels
    return !element.labelTarget;
  }

  // 自定义附加元素
  drawShape(parentNode: any, element: any) {
    const shape = this.bpmnRenderer.drawShape(parentNode, element);

    const suitabilityScore = this.getSuitabilityScore(element);

    if (!isNil(suitabilityScore)) {
      const color = this.getColor(suitabilityScore);

      const rect = drawRect(parentNode, 50, 20, TASK_BORDER_RADIUS, color);

      svgAttr(rect, {
        transform: 'translate(-20, -10)',
      });

      const text = svgCreate('text');

      svgAttr(text, {
        fill: '#fff',
        transform: 'translate(-15, 5)',
      });

      svgClasses(text).add('djs-label');

      // svgAppend(text, document.createTextNode(suitabilityScore));

      text.textContent = suitabilityScore;
      svgAppend(parentNode, text);
    }

    return shape;
  }

  // 获取自定义元素的拖拽时的线框
  getShapePath(shape: any) {
    if (is(shape, 'bpmn:Task')) {
      return getRoundRectPath(shape, TASK_BORDER_RADIUS);
    }

    return this.bpmnRenderer.getShapePath(shape);
  }

  getSuitabilityScore(element: any) {
    const businessObject = getBusinessObject(element);

    // 通过palette自定义的属性suitable
    const { suitable } = businessObject;

    return Number.isFinite(suitable) ? suitable : null;
  }

  getColor(suitabilityScore: any) {
    if (suitabilityScore > 75) {
      return COLOR_GREEN;
    }
    if (suitabilityScore > 25) {
      return COLOR_YELLOW;
    }

    return COLOR_RED;
  }
}

// 对应constructor的参数
CustomRenderer.$inject = ['eventBus', 'bpmnRenderer'];

// helpers //////////

// copied from https://github.com/bpmn-io/bpmn-js/blob/master/lib/draw/BpmnRenderer.js
function drawRect(
  parentNode: any,
  width: any,
  height: any,
  borderRadius: any,
  color: any
) {
  const rect = svgCreate('rect');

  svgAttr(rect, {
    width,
    height,
    rx: borderRadius,
    ry: borderRadius,
    stroke: color,
    strokeWidth: 2,
    fill: color,
  });

  svgAppend(parentNode, rect);

  return rect;
}
