import { Subject as Stream } from 'rxjs';
export { Stream };

export function createStream<T>(fn: (stream$: Stream<T>) => Stream<T>) {
  const stream$ = new Stream<T>();
  if (fn) {
    fn(stream$);
  }
  return stream$;
}
