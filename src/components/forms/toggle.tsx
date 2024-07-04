import { Component } from '@core';
import { Radios } from './radios';

import type { ToggleProps } from './types';

export abstract class ToggleComponent extends Component<ToggleProps> {
  defaultOptions = [
    {
      name: '是',
      id: 1,
    },
    {
      name: '否',
      id: 0,
    },
  ];

  get options() {
    const { options } = this.props;
    return options || this.defaultOptions;
  }

  static mapToProps = (view) => {
    const { options } = view;
    return { options };
  };
}

export class Toggle extends ToggleComponent {
  render() {
    const { value, onChange, readOnly, disabled } = this.props;
    const { options } = this;
    const opt = options.find((item) => +item.id === +value);
    const handleChange = (opt) => {
      onChange(+opt.id as 0 | 1);
    };
    // @ts-ignore
    return (
      <Radios
        options={options as any}
        value={opt as any}
        onChange={handleChange}
        disabled={disabled || readOnly}
      />
    );
  }
}
