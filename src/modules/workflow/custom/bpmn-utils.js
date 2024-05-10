/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/prefer-optional-chain */
/* eslint-disable no-restricted-syntax */

/**
 * 二次修改bpmn，将一些公用函数提取到这里维护
 */

export const { assign } = Object;

export function getOriginal$1(event) {
  return event.originalEvent || event.srcEvent;
}

export function isMac() {
  return /mac/i.test(navigator.platform);
}

export function isButton(event, button) {
  return (getOriginal$1(event) || event).button === button;
}

export function isPrimaryButton(event) {
  // button === 0 -> left áka primary mouse button
  return isButton(event, 0);
}

export function hasPrimaryModifier(event) {
  const originalEvent = getOriginal$1(event) || event;

  if (!isPrimaryButton(event)) {
    return false;
  }

  // Use cmd as primary modifier key for mac OS
  if (isMac()) {
    return originalEvent.metaKey;
  }
  return originalEvent.ctrlKey;
}

/**
 * Return true if element has any of the given types.
 *
 * @param {djs.model.Base} element
 * @param {Array<string>} types
 *
 * @return {boolean}
 */
export function isAny(element, types) {
  return some(types, (t) => is$1(element, t));
}

/**
 * Is an element of the given BPMN type?
 *
 * @param  {djs.model.Base|ModdleElement} element
 * @param  {string} type
 *
 * @return {boolean}
 */
export function is$1(element, type) {
  const bo = getBusinessObject(element);

  return bo && typeof bo.$instanceOf === 'function' && bo.$instanceOf(type);
}

/**
 * Return the business object for a given element.
 *
 * @param  {djs.model.Base|ModdleElement} element
 *
 * @return {ModdleElement}
 */
export function getBusinessObject(element) {
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  return (element && element.businessObject) || element;
}

/**
 * Return true if some elements in the collection
 * match the criteria.
 *
 * @param  {Object|Array} collection
 * @param  {Function} matcher
 *
 * @return {Boolean}
 */

export function some(collection, matcher) {
  return !!find(collection, matcher);
}

/**
 * Find element in collection.
 *
 * @param  {Array|Object} collection
 * @param  {Function|Object} matcher
 *
 * @return {Object}
 */

export function find(collection, matcher) {
  // eslint-disable-next-line no-param-reassign
  matcher = toMatcher(matcher);
  let match;
  forEach$2(collection, (val, key) => {
    if (matcher(val, key)) {
      match = val;
      return false;
    }
  });
  return match;
}

/**
 * Iterate over collection; returning something
 * (non-undefined) will stop iteration.
 *
 * @param  {Array|Object} collection
 * @param  {Function} iterator
 *
 * @return {Object} return result that stopped the iteration
 */

export function forEach$2(collection, iterator) {
  let val;
  let result;

  if (isUndefined$3(collection)) {
    return;
  }

  const convertKey = isArray$4(collection) ? toNum$2 : identity$2;

  for (const key in collection) {
    if (has$2(collection, key)) {
      val = collection[key];
      result = iterator(val, convertKey(key));

      if (result === false) {
        return val;
      }
    }
  }
}

export function toNum$2(arg) {
  return Number(arg);
}

export function identity$2(arg) {
  return arg;
}

export function isUndefined$3(obj) {
  return obj === undefined;
}

export function isArray$4(obj) {
  return nativeToString$2.call(obj) === '[object Array]';
}

// eslint-disable-next-line no-var
export const nativeToString$2 = Object.prototype.toString;
export const nativeHasOwnProperty$2 = Object.prototype.hasOwnProperty;

/**
 * Return true, if target owns a property with the given key.
 *
 * @param {Object} target
 * @param {String} key
 *
 * @return {Boolean}
 */
export function has$2(target, key) {
  return nativeHasOwnProperty$2.call(target, key);
}

export function toMatcher(matcher) {
  return isFunction(matcher)
    ? matcher
    : function (e) {
        return e === matcher;
      };
}

export function isFunction(obj) {
  const tag = nativeToString$2.call(obj);
  return (
    tag === '[object Function]' ||
    tag === '[object AsyncFunction]' ||
    tag === '[object GeneratorFunction]' ||
    tag === '[object AsyncGeneratorFunction]' ||
    tag === '[object Proxy]'
  );
}

export function isEventType(eventBo, type, definition) {
  const isType = eventBo.$instanceOf(type);
  let isDefinition = false;

  const definitions = eventBo.eventDefinitions || [];
  forEach$2(definitions, (def) => {
    if (def.$type === definition) {
      isDefinition = true;
    }
  });

  return isType && isDefinition;
}

export function isEventSubProcess(element) {
  return element && !!getBusinessObject(element).triggeredByEvent;
}

export function hasEventDefinition(element, eventDefinition) {
  const bo = getBusinessObject(element);

  return !!find(bo.eventDefinitions || [], (definition) =>
    is$1(definition, eventDefinition)
  );
}

// 是否条件流
// export function isConditionSequenceFlow(element) {
//   return element && is$1(element, 'bpmn:SequenceFlow') && !!getBusinessObject(element).conditionExpression;
// }

export function isUndefined$2(obj) {
  return obj === undefined;
}

export function isArray$3(obj) {
  return nativeToString$1.call(obj) === '[object Array]';
}

export const nativeToString$1 = Object.prototype.toString;
export const nativeHasOwnProperty$1 = Object.prototype.hasOwnProperty;

export function toNum$1(arg) {
  return Number(arg);
}

export function isExpanded(element, di) {
  if (is$1(element, 'bpmn:CallActivity')) {
    return false;
  }

  if (is$1(element, 'bpmn:SubProcess')) {
    di = di || getDi(element);

    if (di && is$1(di, 'bpmndi:BPMNPlane')) {
      return true;
    }

    return di && !!di.isExpanded;
  }

  if (is$1(element, 'bpmn:Participant')) {
    return !!getBusinessObject(element).processRef;
  }

  return true;
}

/**
 * Returns true, if an element is from a different type
 * than a target definition. Takes into account the type,
 * event definition type and triggeredByEvent property.
 *
 * @param {djs.model.Base} element
 *
 * @return {boolean}
 */
export function isDifferentType(element) {
  return function (entry) {
    const { target } = entry;

    const businessObject = getBusinessObject(element);
    const eventDefinition =
      businessObject.eventDefinitions && businessObject.eventDefinitions[0];

    const isTypeEqual = businessObject.$type === target.type;

    const isEventDefinitionEqual =
      (eventDefinition && eventDefinition.$type) === target.eventDefinitionType;

    const isTriggeredByEventEqual =
      businessObject.triggeredByEvent === target.triggeredByEvent;

    const isExpandedEqual =
      target.isExpanded === undefined ||
      target.isExpanded === isExpanded(element);

    return (
      !isTypeEqual ||
      !isEventDefinitionEqual ||
      !isTriggeredByEventEqual ||
      !isExpandedEqual
    );
  };
}

/**
 * Find element in collection.
 *
 * @param  {Array|Object} collection
 * @param  {Function} matcher
 *
 * @return {Array} result
 */

export function filter(collection, matcher) {
  const result = [];
  forEach$1(collection, (val, key) => {
    if (matcher(val, key)) {
      result.push(val);
    }
  });
  return result;
}

/**
 * Iterate over collection; returning something
 * (non-undefined) will stop iteration.
 *
 * @param  {Array|Object} collection
 * @param  {Function} iterator
 *
 * @return {Object} return result that stopped the iteration
 */

export function forEach$1(collection, iterator) {
  let val;
  let result;

  if (isUndefined$2(collection)) {
    return;
  }

  const convertKey = isArray$3(collection) ? toNum$1 : identity$1;

  for (const key in collection) {
    if (has$1(collection, key)) {
      val = collection[key];
      result = iterator(val, convertKey(key));

      if (result === false) {
        return val;
      }
    }
  }
}

/**
 * Return true, if target owns a property with the given key.
 *
 * @param {Object} target
 * @param {String} key
 *
 * @return {Boolean}
 */

export function has$1(target, key) {
  return nativeHasOwnProperty$1.call(target, key);
}

/**
 * Return the di object for a given element.
 *
 * @param  {djs.model.Base} element
 *
 * @return {ModdleElement}
 */
export function getDi(element) {
  return element && element.di;
}
