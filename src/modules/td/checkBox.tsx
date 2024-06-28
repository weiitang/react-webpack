import { Button, Checkbox } from 'tdesign-react';
import { Empty } from '@src/components/empty';

import * as styles from './checkBox.less';

export function TdCheckBox() {
  return (
    <div>
      <Button>按钮1</Button>
      <span className={styles.space}></span>
      <Checkbox label="test"></Checkbox>
      <Empty></Empty>
    </div>
  );
}
