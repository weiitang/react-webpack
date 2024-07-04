import { Model, createMeta, meta, Validator } from '@core';
import type { ReflectMeta } from '@core';
import { clearHtml } from '@src/utils/functions/html';
import type { IOption } from '@src/typings/type';

export function createEmptyOption(): IOption {
  return {
    id: '',
    name: '',
  };
}

export function createOptionMeta() {
  return {
    default: createEmptyOption(),
    placeholder: '请选择',
    multiple: false,
    empty: (option: IOption) => !option.id,
    map: (option: IOption) => option.id,
    formatter: (option: IOption) => option.name,
    create(value) {
      return value ? value : createEmptyOption();
    },
  };
}

const sharedOptionMeta = {
  default: {
    name: '',
    id: '',
  },
  empty: (option) => !option.id,
  map: (option) => option.id,
};

export const TestInput = createMeta({
  label: 'Input',
  default: '',
  placeholder: '请输入',
  maxLen: 500,
});

export const TestInputNumber = createMeta({
  label: 'InputNumber',
  default: '',
  placeholder: '请输入',
  maxLen: 500,
});

export const TestTextarea = createMeta({
  label: 'Textarea',
  default: '',
  placeholder: '请输入',
  maxLen: 500,
});

export const TestInputRich = createMeta({
  label: 'Notes',
  default: '',
  required: true,
  placeholder: '请输入',
  maxLen: 2000,
  validators: [
    Validator.required('请填写Notes'),
    new Validator({
      determine(value) {
        return !!value;
      },
      validate(value) {
        return clearHtml(value).length <= 2000;
      },
      message: '最多2000字',
    }),
  ],
  module: '',
});

export const IsTimeMeta = createMeta({
  ...createOptionMeta(),
  label: '是否关联时间',
  required: true,
  validators: [Validator.required('请选择是否关联时间')],
  options: [
    { id: '0', name: '否' },
    { id: '1', name: '是' },
  ],
  map(item) {
    return item.id;
  },
});

export const IsPrivaryMeta = createMeta({
  label: '是否保密',
  default: 0,
  required: true,
  watch({ value }) {
    if (value === 0) {
      this.use(IsTimeMeta).value = {
        name: '',
        id: '',
      };
    }
  },
  create(value) {
    return value?.id ? Number(value.id) : 0;
  },
});

export const CheckMeta = createMeta({
  // ...createOptionMeta(),
  default: [],
  label: '复选框',
  required: true,
  validators: [Validator.required('请选择')],
  options: [
    { id: '0', name: '否' },
    { id: '1', name: '是' },
  ],
  // map(item) {
  //   return item.id;
  // },
});

export const DateRangeMeta = createMeta({
  // ...createOptionMeta(),
  default: [],
  label: '时间区间选择框',
  required: true,
  validators: [Validator.required('请选择')],
  // map(item) {
  //   return item.id;
  // },
});

export const DateMeta = createMeta({
  // ...createOptionMeta(),
  default: '',
  label: '时间选择框',
  required: true,
  validators: [Validator.required('请选择')],
  // map(item) {
  //   return item.id;
  // },
});

export const RatingMeta = createMeta<IOption>({
  label: '评估等级',
  source: [
    {
      id: '4',
      parentId: null,
      name: '优',
      weight: 1,
    },
    {
      id: '3',
      parentId: null,
      name: '良',
      weight: 2,
    },
    {
      id: '2',
      parentId: null,
      name: '中',
      weight: 3,
    },
    {
      id: '1',
      parentId: null,
      name: '差',
      weight: 4,
    },
  ],
  required: true,
  validators: [Validator.required(`{label}`)],
  ...sharedOptionMeta,
  to: 'starId',
});

export class TestFromModel extends Model {
  @meta(TestInput)
  inputValue: ReflectMeta<typeof TestInput>;

  @meta(TestInputNumber)
  inputNumberValue: ReflectMeta<typeof TestInputNumber>;

  @meta(TestTextarea)
  textarea: ReflectMeta<typeof TestTextarea>;

  @meta(TestInputRich)
  inputRice: ReflectMeta<typeof TestInputRich>;

  @meta(IsTimeMeta)
  radios: ReflectMeta<typeof IsTimeMeta>;

  @meta(IsPrivaryMeta)
  toggle: ReflectMeta<typeof IsPrivaryMeta>;

  @meta(CheckMeta)
  checkbox: ReflectMeta<typeof CheckMeta>;

  @meta(DateRangeMeta)
  dateRange: ReflectMeta<typeof DateRangeMeta>;

  @meta(DateMeta)
  date: ReflectMeta<typeof DateMeta>;

  @meta(RatingMeta)
  ratingMeta: ReflectMeta<typeof RatingMeta>;
}
