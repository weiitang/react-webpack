import * as React from 'react';
import { DatePicker } from '../date-picker';
import { RangeDatePicker } from '../range-date-picker';
import './style.less';

export default function BasicDemo() {
  const [value, setValue] = React.useState([]);
  return (
    <div className="container">
      <div>
        <div className="item">
          <label>tDesign单选月份模式:</label>
          <DatePicker mode="month" format="YYYY-MM" />
        </div>
        <div className="item">
          <label>range多选月份:</label>
          <RangeDatePicker mode="month" format="YYYY-MM" presets={{}} />
        </div>
        <div>
          <div>range大尺寸 & 星期二 && 受控{value.join('☞')}:</div>
          <RangeDatePicker
            size="large"
            firstDayOfWeek={2}
            value={value}
            onChange={setValue}
          />
        </div>
      </div>
    </div>
  );
}
