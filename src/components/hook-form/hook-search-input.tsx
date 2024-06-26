// 区别在于，支持用户自己输入
import { IOption } from '@src/components/forms/types';
import React from 'react';
import { useRequest } from '@src/hook';
import { SelectInput } from 'tdesign-react';
import { CommonHookFormProps } from './type';

type HookSearchInputProps = CommonHookFormProps & {
  value: IOption;
  onChange: (value: IOption, arg: { type: 'input' | 'select' }) => void;
  search: (keyword: string) => Promise<IOption[]>;
  initSearch?: boolean;
  content?: (option: IOption) => React.ReactNode;
  renderItem?: (option: IOption) => React.ReactNode;
  empty?: React.ReactNode;
  readOnly?: boolean;
  disabled?: boolean;
};

export const HookSearchInput = (props: HookSearchInputProps) => {
  const {
    field,
    search,
    content,
    onChange,
    empty,
    renderItem,
    disabled,
    readOnly,
    value,
    initSearch,
    ...attrs
  } = props;

  React.useEffect(() => {
    if (value !== field.value && value !== undefined) {
      field.onChange({
        target: { value },
      });
    }
  }, [value]);
  const text = field.value?.name;
  // 上一次选中的文本
  const latest = React.useRef('');
  // 当前输入的关键词
  const [keyword, setKeyword] = React.useState(text);
  // 使用keyword作为搜索词，可以保证在选中某一个的时候，不会再发生请求
  const {
    run,
    loading,
    data: options,
  } = useRequest(search, {
    manual: true,
    throttleWait: 500,
    defaultData: [],
  });

  React.useEffect(() => {
    run(keyword);
  }, [keyword]);

  React.useEffect(() => {
    initSearch && search?.(keyword);
  }, [initSearch]);

  const contentOptions = options.map((opt) =>
    content
      ? {
          ...opt,
          content: () => content(opt),
        }
      : opt
  );

  const handleInputChange = (text) => {
    const v = {
      id: '',
      name: text,
    };
    onChange?.(v, { type: 'input' });
    field.onChange({
      target: { value: v },
    });
    setKeyword(text);
  };

  const handleSelectItem = (item: IOption) => {
    onChange?.(item, { type: 'select' });
    field.onChange({
      target: { value: item },
    });
    latest.current = item.name;
    setVisible(false);
  };

  const [visible, setVisible] = React.useState(false);

  const showPopupEmpty = empty ? visible : !!contentOptions.length && visible;

  return (
    <SelectInput
      {...attrs}
      allowInput
      clearable
      value={text}
      popupVisible={showPopupEmpty}
      loading={loading}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
      onInputChange={handleInputChange}
      panel={
        !contentOptions.length ? (
          empty || null
        ) : (
          <div
            className="t-select__dropdown narrow-scrollbar"
            style={{ boxShadow: 'none', maxHeight: 300, overflowY: 'auto' }}
          >
            <div className="t-select__dropdown-inner t-select__dropdown-inner--size-m">
              <div className="t-select__list">
                {contentOptions.map((optionItem, index) =>
                  optionItem.content ? (
                    optionItem.content()
                  ) : (
                    <div
                      className="t-select-option"
                      onClick={() => handleSelectItem(optionItem)}
                      key={index}
                    >
                      {renderItem ? (
                        renderItem(optionItem)
                      ) : (
                        <span>{optionItem.name}</span>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        )
      }
      // suffixIcon={<SearchIcon color="rgba(0, 0, 0, 0.4)" />}
      disabled={disabled || readOnly}
    ></SelectInput>
  );
};
