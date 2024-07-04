import { DatePicker } from '../../date-picker';
import { RangeDatePicker } from '../range-date-picker';
import './style.less';

export default function BasicDemo() {
  return (
    <div className="container">
      <div>
        <div className="item">
          <label>tDesign默认单选:</label>
          <DatePicker />
        </div>
        <div className="item">
          <label>range多选:</label>
          <RangeDatePicker clearable />
        </div>
      </div>
    </div>
  );
}
