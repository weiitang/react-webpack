import { Model, createMeta, meta, Validator } from '@core';
import type { ReflectMeta } from '@core';
import { clearHtml } from '@src/utils/functions/html';

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

export class TestFromModel extends Model {
  @meta(TestInput)
  inputValue: ReflectMeta<typeof TestInput>;

  @meta(TestInputNumber)
  inputNumberValue: ReflectMeta<typeof TestInputNumber>;

  @meta(TestTextarea)
  textarea: ReflectMeta<typeof TestTextarea>;

  @meta(TestInputRich)
  inputRice: ReflectMeta<typeof TestInputRich>;
}
