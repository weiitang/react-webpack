import * as React from 'react';
import { Stars } from '../stars';
import * as styles from './stars.css';

export default function Demo() {
  const [current, setCurrent] = React.useState(3);
  const onChange = (value: number) => {
    setCurrent(value);
  };
  return (
    <div>
      <h2>种类1:正常</h2>
      <Stars value={1} />
      <h2>种类2:small</h2>
      <Stars value={1} max={10} size={'small'} />
      <h2>种类3:large</h2>
      <Stars value={1} size={'large'} />
      <h2>种类4:xlarge</h2>
      <Stars value={10} max={15} size={'xlarge'} />
      <h2>种类5:可选</h2>
      <Stars value={current} size={'xlarge'} editable onChange={onChange} />
      <h2>种类6:outline</h2>
      <Stars
        value={current}
        type="outline"
        size={'xlarge'}
        editable
        onChange={onChange}
      />
      <h2>种类7:自定义class</h2>
      <Stars
        activeClassName={styles.active}
        className={styles.custom}
        value={current}
        size={'xlarge'}
        editable
        onChange={onChange}
      />
    </div>
  );
}
