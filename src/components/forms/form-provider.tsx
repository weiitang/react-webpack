import { useMemo, useContext } from 'react';
import { useShallowLatest } from '@src/hook';
import { FormContext } from './context';
import type { IFormProviderProps } from './types';

const { Provider } = FormContext;

export function FormProvider(props: IFormProviderProps) {
  // 当前Provider将继承上一层Provide的值，如果需要特定的值，应该主动传入
  const parentContext = useContext(FormContext);
  const { settings: parentConfig } = parentContext;

  const {
    model = parentContext.model,
    validateManually = parentContext.validateManually,
    labelAlign = parentContext.labelAlign,
    validateStatus = parentContext.validateStatus,
    children,
    settings: passedConfig,
    disabled,
  } = props;

  const settings = useShallowLatest(
    passedConfig || parentConfig
      ? {
          ...(parentConfig || {}),
          ...(passedConfig || {}),
        }
      : undefined
  );

  const context = useMemo(
    () => ({
      model,
      validateManually,
      labelAlign,
      validateStatus,
      settings,
      disabled,
    }),
    [model, validateManually, labelAlign, validateStatus, settings, disabled]
  );
  return <Provider value={context}>{children}</Provider>;
}

export function useFormContext() {
  return useContext(FormContext);
}
