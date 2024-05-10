/**
 * 简单的事件总线
 */

const eventHandlers = {};

export function on(eventName: string, handler: (data?: any) => void) {
  if (!eventHandlers[eventName]) {
    eventHandlers[eventName] = [];
  }

  eventHandlers[eventName].push(handler);
}

export function off(eventName: string, handler: (data?: any) => void) {
  if (!eventHandlers[eventName]) {
    return;
  }

  const index = eventHandlers[eventName].indexOf(handler);
  if (index !== -1) {
    eventHandlers[eventName].splice(index, 1);
  }
}

export function trigger(eventName: string, data?: any) {
  if (eventHandlers[eventName]) {
    eventHandlers[eventName].forEach((fn: any) => {
      if (typeof fn === 'function') {
        fn(data);
      }
    });
  }
}
