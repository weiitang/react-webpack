import { UseControllerReturn } from 'react-hook-form';

export type CommonHookFormProps = Pick<
  UseControllerReturn,
  'field' | 'fieldState' | 'formState'
>;
