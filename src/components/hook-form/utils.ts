import { FORM_ITEM_ERROR_CLASS } from './index';

export class EventEmitter {
  listeners: Record<string, Function[]> = {};

  on(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event: string, callback: Function) {
    if (!this.listeners[event]) {
      return;
    }
    this.listeners[event] = this.listeners[event].filter(
      (listener) => listener !== callback
    );
  }

  emit(event: string, ...args: any[]) {
    if (!this.listeners[event]) {
      return;
    }
    this.listeners[event].forEach((listener) => listener(...args));
  }

  once(event: string, callback: Function) {
    const onceCallback = (...args: any[]) => {
      this.off(event, onceCallback);
      callback(...args);
    };
    this.on(event, onceCallback);
  }
}

export function scrollIntoErrors() {
  const errorDom = document.querySelector(`.${FORM_ITEM_ERROR_CLASS}`);
  errorDom?.scrollIntoView?.({
    block: 'center',
    inline: 'nearest',
    behavior: 'auto',
  });
}
