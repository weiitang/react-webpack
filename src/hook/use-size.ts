import React from 'react';
import { useThrottleFn } from '.';

export function useSize() {
  const [size, updateSize] = React.useState<{ height: number; width: number }>({
    height: document.documentElement.offsetHeight,
    width: document.documentElement.offsetWidth,
  });

  const update = useThrottleFn(() => {
    updateSize({
      height: document.documentElement.offsetHeight,
      width: document.documentElement.offsetWidth,
    });
  }, 1000);
  React.useEffect(() => {
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return size;
}
