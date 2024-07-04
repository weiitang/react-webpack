import React from 'react';
import { StarSelect } from '../';

export default function () {
  const [value, uV] = React.useState<number | undefined>();
  const [desc, uD] = React.useState('');
  return (
    <div className="star-select-demo">
      <div>
        默认值情况
        <StarSelect placeholder="默认情况" defaultValue={2} />
      </div>
      <div>
        自定义desc与max
        <StarSelect
          placeholder="自定义desc 与 max"
          max={5}
          desc={['优', '良', '中', '差', '极差']}
        />
      </div>
      <div>
        多选
        <StarSelect placeholder="多选" multiple defaultValue={[2, 3]} />
      </div>
      <div>
        受控
        <StarSelect
          placeholder="受控"
          value={value}
          onChange={(params) => {
            if (!Array.isArray(params)) {
              uV(params.value);
              uD(params.desc);
            }
          }}
        />
        {value} - {desc}
      </div>
    </div>
  );
}
