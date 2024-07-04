/**
 * 星级级联选择器
 */
import React from 'react';
import { Stars } from '@src/components/stars';
import { Select } from 'tdesign-react';
import classnames from 'classnames';
import type { OptionsItem } from '@src/typings/type';
import { useEvent } from '@src/hook';
import * as Css from './index.module.less';
import type { StarSelectProp } from './types';
const { Option } = Select;

export const StarSelect = (props: StarSelectProp) => {
  const {
    max: propMax,
    desc: propDesc,
    onChange,
    value,
    defaultValue,
    multiple,
    placeholder,
    minCollapsedNum,
    disabled,
    clearable,
    className,
    options,
  } = props;

  const partialOptions = React.useMemo<
    Pick<OptionsItem, 'id' | 'name'>[]
  >(() => {
    if (options) {
      return options;
    }

    const values = new Array(propMax)
      .fill(0)
      .map((_, index) => propMax - index)
      .reverse();
    return values.map((value, index) => ({
      id: `${value}`,
      name: propDesc[index],
    }));
  }, [propMax, propDesc, options]);

  const handleChange = useEvent((values) => {
    const getDesc = (v: number) =>
      partialOptions.find((i) => i.id === String(v))?.name ?? '';
    let params;
    if (Array.isArray(values)) {
      params = values.map((item) => ({
        value: item,
        desc: getDesc(item),
      }));
    } else {
      params = {
        value: values,
        desc: getDesc(values),
      };
    }
    onChange?.(params);
  });

  return (
    <Select
      value={value}
      defaultValue={defaultValue}
      onChange={handleChange}
      multiple={multiple}
      placeholder={placeholder}
      disabled={disabled}
      minCollapsedNum={minCollapsedNum}
      tagInputProps={{
        excessTagsDisplayType: 'scroll',
      }}
      className={classnames(Css.starSelect, className)}
      clearable={clearable}
    >
      {partialOptions.map((item) => {
        const { id, name } = item;
        const numberValue = Number(id);
        return (
          <Option key={numberValue} label={name} value={numberValue}>
            <span className={Css.starSelectOption}>
              <Stars
                max={partialOptions.length}
                value={numberValue}
                size="large"
              />
              <span className={Css.desc}>{name}</span>
            </span>
          </Option>
        );
      })}
    </Select>
  );
};
StarSelect.defaultProps = {
  max: 4,
  multiple: false,
  minCollapsedNum: 0,
};
