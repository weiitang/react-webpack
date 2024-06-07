import {
  Input as TInput,
  InputProps as TInputProps,
  InputAdornment,
} from 'tdesign-react';
import { forwardRef, type ReactElement } from 'react';
import type { InputComponent } from './types';

export type IInputProps = TInputProps & {
  prefix?: string | ReactElement;
  suffix?: string | ReactElement;
};

export const Input: InputComponent = forwardRef((props, ref: any) => {
  const { prefix, suffix, readOnly, disabled, ...attrs } = props;

  const input = <TInput ref={ref} {...attrs} disabled={disabled || readOnly} />;

  if (suffix || prefix) {
    return (
      <InputAdornment prepend={prefix} append={suffix}>
        {input}
      </InputAdornment>
    );
  }

  return input;
});

Input.mapToProps = ({ unit, prefix, suffix = unit }) => ({
  suffix,
  prefix,
});
