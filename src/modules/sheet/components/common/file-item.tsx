import classnames from 'classnames';
import * as styles from './index.less';

export const ListItem = (props) => {
  const {
    label,
    value,
    className,
    separator = ':',
    style,
    labelClassName,
    valueClassName,
  } = props;
  return (
    <div className={classnames(styles.itemWrap, className)} style={style}>
      <div className={classnames(styles.label, labelClassName)}>
        {label}
        {separator}
      </div>
      <div className={classnames(styles.value, valueClassName)}>{value}</div>
    </div>
  );
};
