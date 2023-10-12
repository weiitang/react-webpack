import React from 'react';
import { useCreation, useUnmount, useMemoizedFn } from '.';
import { EventBus } from '@src/lib/event-bus';
import type { Fn } from '@src/lib/event-bus';

export interface UseEventBusProp<T> {
  /**
   * 是否手动出发listener，传true，则手动调用 run 来执行已经出发的listener
   * @default: false
   */
  manual?: boolean;
  once?: boolean;
  eventBus?: EventBus<T>;
}

const eventBusInstance = new EventBus();

export function useEventBus<T = any>(prop: UseEventBusProp<T> = {}) {
  const { manual = false, eventBus = eventBusInstance, once = true } = prop;
  const pendingList = useCreation<Set<Fn>>(() => new Set(), []);
  const unsubscribeSet = useCreation<Set<Fn>>(() => new Set(), []);
  const bindingRef = useCreation<Map<T, Set<Fn>>>(() => new Map(), []);

  // 默认在unmount时解绑
  useUnmount(() => {
    unsubscribeSet.forEach((unsubscribe) => unsubscribe());
  });

  const listen = useMemoizedFn<EventBus<T>['listen']>((event: T, fn: Fn) => {
    const listenFn = manual
      ? () => pendingList.add((...args: any[]) => fn(...args))
      : fn;
    const events = bindingRef.get(event) ?? new Set();
    const isBinging = events.has(fn);
    events.add(fn);
    bindingRef.set(event, events);
    const unsubscribe =
      once && isBinging ? () => true : eventBus.listen(event, listenFn);
    unsubscribeSet.add(unsubscribe);
    return unsubscribe;
  });

  const useListener = (event: T, fn: Fn) => {
    React.useEffect(() => listen(event, fn), [event, fn, listen]);
  };

  const run = useMemoizedFn(() => {
    pendingList.forEach((fn) => {
      fn();
      pendingList.delete(fn);
    });
  });

  const { clear, trigger } = eventBus;

  return {
    useListener,
    listen,
    trigger: trigger.bind(eventBus) as EventBus<T>['trigger'],
    clear: clear.bind(eventBus) as EventBus<T>['clear'],
    run,
  };
}
