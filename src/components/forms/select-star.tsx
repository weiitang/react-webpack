import { Stars } from '@src/components/stars';
import type { IOption } from '@src/typings/type';
// import { useDataSource, isDataSource, DataSource } from '@core';
import type { SelectStarComponent } from './types';
import * as Css from './select-star.less';
import { isEmpty } from 'lodash';

/**
 * 选择星星组件，后端会给一个option，我们需要将提交的数据转化为前端可用的，然后又转化为后端可用的提交
 * @param props
 * @returns
 */
export const SelectStar: SelectStarComponent = function (props) {
  const { value, onChange, options: source, readOnly, disabled } = props;

  const [data] = [[]];
  const options = isEmpty(source) ? data : (source as IOption[]);

  // 按value排序
  // TODO 后期可能不能按value来排序
  const items = [...options].sort((a, b) => {
    if (+a.id > +b.id) {
      return 1;
    }
    if (+a.id < +b.id) {
      return -1;
    }
    return 0;
  });
  const texts = items.map((item) => item.name);

  const handleChange = (value: number) => {
    const index = value - 1;
    const item = items[index];
    onChange(item);
  };

  const index = items.findIndex((item) => +item.id === +value?.id) ?? 0;

  return (
    <div className={Css.selectStar}>
      <Stars
        value={index + 1}
        onChange={handleChange}
        max={items.length}
        size="normal"
        editable={!disabled && !readOnly}
      />
      <span className={Css.selectStarText}>{texts[index]}</span>
    </div>
  );
};

SelectStar.mapToProps = ({ source, options = source }) => ({ options });
