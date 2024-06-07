import { Model, createMeta, meta } from '@core';
import type { ReflectMeta } from '@core';

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

export class TestFrom extends Model {
  @meta(TestInput)
  inputValue: ReflectMeta<typeof TestInput>;

  @meta(TestInputNumber)
  inputNumberValue: ReflectMeta<typeof TestInputNumber>;
}
