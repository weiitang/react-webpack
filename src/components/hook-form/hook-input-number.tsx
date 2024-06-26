/* eslint-disable @typescript-eslint/no-unused-vars */
import { UseControllerReturn } from 'react-hook-form';
import { InputNumberProps } from '@src/components/forms/types';
import { InputNumber } from '../forms';
interface HookInputNumberProps
  extends InputNumberProps,
    Pick<UseControllerReturn, 'field' | 'fieldState' | 'formState'> {}

export const HookInputNumber = (props: HookInputNumberProps) => {
  const { field, fieldState, formState, ...restProps } = props;

  return (
    <InputNumber
      value={field.value}
      onChange={(value) => {
        field.onChange?.({
          target: { value },
        });
      }}
      {...restProps}
    />
  );
};
