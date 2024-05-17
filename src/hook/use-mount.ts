// a-hooks
import React from 'react';

export function useMount(fn: () => void) {
  React.useEffect(() => {
    fn?.();
  }, []);
}
