/* eslint-disable @typescript-eslint/no-unused-vars */
import { Input } from 'tdesign-react';
import type {
  InputNumberComponent,
  InputNumberProps,
} from '@src/components/forms/types';
import { useInputNumber } from '@src/components/forms/hook/input-number';
import { useRef } from 'react';
import classNames from 'classnames';
import * as Css from './input-number.less';

export const InputNumber: InputNumberComponent = (props) => {
  const el = useRef(null);
  const {
    prefix,
    suffix,
    value,
    onChange: givenOnChange,
    readOnly,
    disabled,
    className,
    separator = ',',
    onFocus,
    ...attrs
  } = props;
  const { numeric, onTextChange, onCursorChange } =
    useInputNumber<InputNumberProps>({
      ...props,
      separator,
      setCursor(cursor) {
        if (!el.current) {
          return;
        }
        // @ts-ignore
        const input = el.current.inputElement;
        input.setSelectionRange(cursor, cursor);
      },
      getCursor() {
        if (!el.current) {
          return -1;
        }
        return el.current.inputElement.selectionStart;
      },
    });

  return (
    <Input
      {...attrs}
      value={numeric}
      ref={el}
      disabled={disabled || readOnly}
      suffix={suffix}
      label={prefix ? <span>{prefix}</span> : null}
      onChange={onTextChange}
      onFocus={() => {
        onCursorChange();
        onFocus?.(value);
      }}
      onClick={onCursorChange}
      className={classNames([Css.inputNumber, className])}
    />
  );
};

InputNumber.mapToProps = ({
  unit,
  prefix,
  suffix,
  text,
  limit,
  max,
  min,
  separator,
}) => ({
  suffix: unit ? ` ${unit}` : suffix,
  prefix,
  text,
  limit,
  max,
  min,
  separator,
});
