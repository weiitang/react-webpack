import { useForm, FormProvider, UseFormProps } from 'react-hook-form';
import merge from 'lodash/merge';
import get from 'lodash/get';
import { useEffect } from 'react';
import { HookFormContext } from './context';
import { FormModelType } from './form-model';

export interface HookFormProps {
  formModel: FormModelType;
  useFormOptions?: UseFormProps;
  onSubmit?: (data: any) => void;
  children?: React.ReactNode;
}

export const HookForm = (props: HookFormProps) => {
  const { formModel, useFormOptions, children, onSubmit, ...others } = props;

  const mergeOptions = merge(
    {},
    { defaultValues: formModel.defaultValues, mode: 'all' },
    useFormOptions
  );
  const methods = useForm(mergeOptions);

  if (!formModel.methods) formModel.methods = methods;

  useEffect(() => {
    formModel.eventEmitter.emit('mounted', formModel.methods);

    const subscription = formModel.watch((values, { name, type }) => {
      formModel.eventEmitter.emit('watchEffect', values, {
        name,
        type,
        formValues: values,
      });
      formModel.eventEmitter.emit(`watchEffect:${name}`, get(values, name), {
        name,
        type,
        formValues: values,
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <HookFormContext.Provider value={formModel}>
      <FormProvider {...formModel.methods}>
        <form onSubmit={formModel.methods.handleSubmit(onSubmit)} {...others}>
          {children}
        </form>
      </FormProvider>
    </HookFormContext.Provider>
  );
};
