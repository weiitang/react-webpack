/* eslint-disable @typescript-eslint/ban-types */
import React from 'react';

export function useEvent<T extends Function = (...args: any[]) => any>(
  handler: T
): T {
  const handlerRef = React.useRef<Function>(handler);
  React.useLayoutEffect(() => {
    handlerRef.current = handler;
  });

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  return React.useCallback((...args) => handlerRef.current?.(...args), []);
}
