import {
  Select as TSelect,
  Cascader,
  SelectProps as TSelectProps,
} from 'tdesign-react';
// import { isDataSource, useDataSource } from '@core';
import type { IOption } from './types';
import type { FormComponent, SelectProps } from './types';
import { decideby, isArray } from 'ts-fns';
import { createEmptyOption } from './types';
import classNames from 'classnames';
import { forwardRef, useEffect, useState } from 'react';
import * as Css from './select.less';

/**
 * 不支持传children，只能通过传options来确定选项
 * @param props
 * @returns
 */
export const Select: FormComponent<
  SelectProps & Pick<TSelectProps, 'onSearch'>
> = forwardRef((props, ref: any) => {
  const {
    options: source,
    value: originValue,
    multiple,
    readOnly,
    disabled,
    onChange,
    status,
    strictly,
    tips,
    className,
    optionsFilter,
    ...attrs
  } = props as any;
  const value = decideby(() => {
    if (multiple) {
      return isArray(originValue) ? originValue : [];
    }
    return originValue ? originValue : {};
  });

  // @ts-ignore
  // const [data] = useDataSource(source as DataSource<IOption[], void>);
  const [data] = [[]];
  const [options, setOptions] = useState<IOption[]>([]);

  const formatOptions = (options: IOption[]) => {
    let newOptions = options;
    if (tips) {
      newOptions = options.map((opt) => ({
        ...opt,
        content: tips(opt),
      }));
    }
    // 对options数据进行过滤
    if (optionsFilter) {
      newOptions = optionsFilter(newOptions);
    }
    setOptions(newOptions);
  };

  // 保持原本功能不变的情况，新增 options 支持 Promise
  useEffect(() => {
    // if (isDataSource(source)) {
    if (false) {
      formatOptions(data);
    } else if (source instanceof Promise) {
      source.then((res) => {
        formatOptions(res);
      });
    } else {
      formatOptions(source as IOption[]);
    }
  }, [source, tips, data]);

  const handleChange = (value) => {
    // 清空
    if (!value) {
      onChange(multiple ? [] : createEmptyOption());
    } else {
      onChange(value);
    }
  };

  const selectInputProps = {
    status,
    clearable: true,
    disabled: disabled || readOnly,
    onClear: () => handleChange(null),
  };

  if (options?.some((item) => item.children)) {
    const valueInput = decideby(() => {
      if (multiple) {
        return (value as IOption[]).map((item) => item?.id || item);
      }
      return (value as IOption).id;
    });
    // 对onChange进行转化，把真正选中的数据给到onChange
    const handleChange = (...args) => {
      const [selected, ctx] = args;

      // 清空操作
      if (!selected) {
        onChange(multiple ? [] : createEmptyOption());
        return;
      }

      if (multiple) {
        const keys = selected.reduce((keys, id) => {
          // eslint-disable-next-line no-param-reassign
          keys[id] = true;
          return keys;
        }, {});
        const next = [];
        const walk = (items) => {
          if (!Object.keys(keys).length) {
            return;
          }
          items.forEach((item: IOption) => {
            const { id, children } = item;
            if (keys[id]) {
              next.push(item);
              delete keys[id];
              return;
            }
            if (children) {
              walk(children);
            }
          });
        };
        walk(options);
        onChange(next);
        return;
      }

      const {
        node: { data },
      } = ctx;
      onChange(data);
    };

    // TDesign Cascader不支持类似Select的valueType的能力
    return (
      <div className={classNames([Css.formSelectComponent, className])}>
        <Cascader
          filterable
          showAllLevels={false}
          {...attrs}
          multiple={multiple}
          options={options}
          value={valueInput}
          keys={{ value: 'id', label: 'name', children: 'children' }}
          onChange={handleChange}
          selectInputProps={selectInputProps}
          disabled={disabled || readOnly}
          checkStrictly={strictly}
        />
      </div>
    );
  }

  return (
    <div className={classNames([Css.formSelectComponent, className])}>
      <TSelect
        ref={ref}
        filterable={options.length > 10} // 大于10时自动可搜索
        {...attrs}
        multiple={multiple}
        value={value}
        keys={{ value: 'id', label: 'name' }}
        valueType="object"
        options={options}
        selectInputProps={selectInputProps}
        disabled={disabled}
        onChange={handleChange}
      />
    </div>
  );
});

Select.mapToProps = ({ source, options = source, max, multiple }) => ({
  options,
  multiple,
  max,
});
