import React from 'react';

export function useUnmount(fn: () => void) {
  React.useEffect(() => () => fn?.(), []);
}
