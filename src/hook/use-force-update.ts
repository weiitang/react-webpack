import { useState } from 'react';

export function useForceUpdate() {
  const [, forceUpdate] = useState({});
  return () => forceUpdate({});
}
