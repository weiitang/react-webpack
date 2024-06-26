/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import { SelectProps as TSelectProps } from 'tdesign-react';
import { UseControllerReturn } from 'react-hook-form';
import { IOption, SelectProps } from '@src/components/forms/types';
import classNames from 'classnames';
import { throttle } from 'lodash';
import { Select } from '../forms';
import * as styles from './index.less';

export type HookSelectProps = Pick<
  SelectProps,
  | 'value'
  | 'onChange'
  | 'multiple'
  | 'strictly'
  | 'tips'
  | 'className'
  | 'style'
  | 'loading'
> & {
  initSearch?: boolean;
  options: IOption[] | (() => IOption[] | Promise<IOption[]>);
  clearable?: boolean;
  field: UseControllerReturn['field'];
  fieldState: UseControllerReturn['fieldState'];
  formState: UseControllerReturn['formState'];
  onSearch?: (
    keyword: string,
    e: React.KeyboardEvent<HTMLDivElement>
  ) => Promise<IOption[]>;
  max?: number;
  /**
   * TPP 有一些场景，后端会给出 tags 字段，前端可以根据一些场景去根据 tags 筛选出特定的 options
   */
  optionFilterTag?: string | string[];
};

export const HookSelect = (props: HookSelectProps) => {
  const {
    fieldState,
    formState,
    field,
    onChange,
    clearable,
    options: propOptions,
    className,
    initSearch,
    optionFilterTag,
    ...otherProps
  } = props;

  const [loading, setLoading] = React.useState(false);
  const [options, setOptions] = React.useState(
    Array.isArray(propOptions) ? propOptions : []
  );

  React.useEffect(() => {
    function tagFilterFunction(options: IOption[]) {
      const tags = (() => {
        if (!optionFilterTag) return [];
        if (typeof optionFilterTag === 'string') return [optionFilterTag];
        if (Array.isArray(optionFilterTag)) return optionFilterTag;
        return [];
      })();
      if (!tags.length) return options;
      return options.filter((option) => {
        if (!option.tags) return false;
        return tags.some((tag) => option.tags.includes(tag));
      });
    }
    if (typeof propOptions === 'function') {
      const result = propOptions();
      if (Array.isArray(result)) {
        setOptions(tagFilterFunction(result));
      } else {
        setLoading(true);
        result
          .then((result) => {
            setOptions(tagFilterFunction(result));
          })
          .finally(() => setLoading(false));
      }
    } else if (Array.isArray(propOptions)) {
      setOptions(tagFilterFunction(propOptions));
    }
  }, [propOptions, optionFilterTag]);

  const handleChange = React.useCallback(
    (value: IOption | IOption[]) => {
      let finalValue = value;
      // 单选的清空逻辑
      // 需要兼容 react-hook-form 的 required 判断规则，如果是 { id: '', name: '' }，hookForm会认为已经有填了
      if (!Array.isArray(value) && value?.id === '' && value?.name === '') {
        finalValue = null;
      }
      field.onChange?.({
        target: { value: finalValue },
      });
      onChange?.(finalValue);
    },
    [onChange, field]
  );

  // 处理 onSearch

  const onSearch: TSelectProps['onSearch'] = React.useMemo(() => {
    if (!props.onSearch) return null;
    return throttle((keyword, { e }) => {
      setLoading(true);
      props
        .onSearch(keyword, e)
        .then((res) => {
          setOptions(Array.isArray(res) ? res : []);
        })
        .finally(() => setLoading(false));
    }, 300);
  }, [props.onSearch]);

  React.useEffect(() => {
    const value = Array.isArray(field.value) ? field.value[0] : field.value;
    initSearch && onSearch?.(value, { e: null });
  }, [initSearch]);

  return (
    <Select
      value={field.value}
      {...otherProps}
      className={classNames([styles.hookSelect, className])}
      options={options}
      onChange={handleChange}
      onSearch={onSearch}
      loading={loading}
    />
  );
};
