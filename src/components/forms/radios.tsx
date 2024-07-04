import { Radio } from 'tdesign-react';
// import { isDataSource, useDataSource } from '@core';
// import type { DataSource } from '@core';
import type { RadiosComponent } from './types';
import type { IOption } from '@src/typings/type';
import { isEmpty } from 'lodash';

const { Group } = Radio;

/**
 * 不支持传children，只能使用options设定选项
 * @param props
 * @returns
 */
export const Radios: RadiosComponent = function (props) {
  const {
    options: source,
    value,
    onChange,
    readOnly,
    disabled,
    ...attrs
  } = props;

  const [data] = [[]];
  const options = isEmpty(source) ? data : (source as IOption[]);
  // const [data] = useDataSource(source as DataSource<IOption[], any>);
  // const options = isDataSource(source) ? data : (source as IOption[]);

  const opts = options.map(({ name, id }) => ({ label: name, value: id }));
  const v = value?.id;
  const handleChange = (value) => {
    const opt = options.find((item) => item.id === value);
    onChange(opt);
  };

  // @ts-ignore
  return (
    <Group
      {...attrs}
      value={v}
      options={opts}
      onChange={handleChange}
      disabled={disabled || readOnly}
    />
  );
};

Radios.mapToProps = ({ options }) => ({ options });
