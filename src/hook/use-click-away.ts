import * as React from 'react';

export const useLatest = function <T>(value: T) {
  const ref = React.useRef(value);
  ref.current = value;

  return ref;
};

export const useClickAway = function <T extends Event = PointerEvent>(
  onClickAway: (event: T) => void,
  targets: React.MutableRefObject<Element | null>[]
) {
  const onClickAwayRef = useLatest(onClickAway);

  React.useEffect(() => {
    const handler = (event) => {
      if (targets.some((target) => target.current?.contains?.(event.target)))
        return;
      onClickAwayRef.current(event);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [targets]);
};
