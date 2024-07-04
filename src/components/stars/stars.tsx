import * as React from 'react';
import classnames from 'classnames';
import * as styles from './stars.less';
import { StarsProps } from './types';

Stars.defaultProps = {
  max: 5,
  size: 'normal',
  type: 'filled',
};

function Stars(props: StarsProps) {
  const {
    max,
    value,
    size,
    onChange,
    editable,
    className,
    type,
    activeClassName,
  } = props;
  const [current, setCurrent] = React.useState(value);

  React.useEffect(() => {
    setCurrent(value);
  }, [value]);

  const classNames = classnames(
    {
      [styles.starWrap]: true,
      [styles.small]: size === 'small',
      [styles.large]: size === 'large',
      [styles.xlarge]: size === 'xlarge',
      [styles.edit]: editable,
    },
    className
  );

  const iconElement = (index: number) => {
    const active = index < current;
    const iconClass = classnames({
      [styles.star]: true,
      [styles.active]: active,
      [activeClassName]: active,
    });
    return (
      <div
        key={index}
        onClick={() => {
          if (editable && onChange) {
            onChange(index + 1);
          }
        }}
        className={iconClass}
      >
        {type === 'outline' && !active ? <span>🦍</span> : <span>⭐️</span>}
      </div>
    );
  };
  return (
    <div className={classNames}>
      {Array(max)
        .fill(0)
        .map((_, index) => iconElement(index))}
    </div>
  );
}

export default Stars;
export { Stars };
