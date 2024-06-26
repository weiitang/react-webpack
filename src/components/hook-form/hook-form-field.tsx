import { useFormContext, Controller, ControllerProps } from 'react-hook-form';

export function HookFormField(props: ControllerProps) {
  const methods = useFormContext();

  return <Controller {...props} control={methods.control} />;
}
