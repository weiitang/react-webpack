export type Fn = (...args: any) => void;

export class EventBus<T, FnType extends (args?: any) => any = Fn> {
  private listeners = new Map<T, FnType[]>();

  getEvents(eventName: T): FnType[] {
    return this.listeners.get(eventName) ?? [];
  }

  listen(eventName: T, fn: FnType) {
    const events = this.getEvents(eventName);
    this.listeners.set(eventName, [...events, fn]);
    return () => {
      this.listeners.set(
        eventName,
        this.getEvents(eventName).filter((item) => item !== fn)
      );
    };
  }

  trigger<Arg extends any[] = any>(eventName: T, ...args: Arg) {
    this.getEvents(eventName).forEach((fn) => fn?.(...(args ?? [])));
  }

  clear(eventName?: T, fn?: FnType) {
    if (eventName) {
      if (fn) {
        const fns = this.getEvents(eventName);
        this.listeners.set(
          eventName,
          fns.filter((f) => f !== fn)
        );
      } else {
        this.listeners.set(eventName, []);
      }
    } else {
      this.listeners = new Map();
    }
  }
}
