import { Checkbox } from 'tdesign-react';
// import { isDataSource, useDataSource } from '@core';
// import type { DataSource } from '@core';
import type { CheckboxesComponent } from './types';
import type { IOption } from '@src/typings/type';
import { isEmpty } from 'lodash';

const { Group } = Checkbox;

/**
 * 不支持传children，只能通过传options来确定选项
 * @param props
 * @returns
 */
export const Checkboxes: CheckboxesComponent = function (props) {
  const { options: source, ...attrs } = props;

  // @ts-ignore
  // const [data] = useDataSource(source as DataSource<IOption[], void>);
  // const options = isDataSource(source) ? data : (source as IOption[]);
  const [data] = [[]];
  const options = isEmpty(source) ? data : (source as IOption[]);
  const items = options.map(({ id, name }) => ({ label: name, value: id }));

  // @ts-ignore
  return <Group {...attrs} options={items} />;
};

Checkboxes.mapToProps = ({ source, options = source }) => ({ options });
