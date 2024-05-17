import React from 'react';
import { useUnmount } from './use-unmount';

export function useUpdate() {
  const [, setState] = React.useState({});
  const isUnMountedRef = React.useRef(false);
  useUnmount(() => (isUnMountedRef.current = true));
  const update = React.useCallback(() => {
    if (isUnMountedRef.current) return;
    setState({});
  }, []);
  return update;
}
