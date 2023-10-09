import React from 'react';
import { Button, Checkbox } from 'tdesign-react';

import styles from './checkBox.less';

export function TdCheckBox() {

  return (
    <div>
      <Button>按钮1</Button>
      <span className={styles.space}></span>
      <Checkbox label="test"></Checkbox>
    </div>
  );
}
