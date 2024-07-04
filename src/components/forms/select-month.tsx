import { DatePicker } from 'tdesign-react';
import { Component } from '@core';
import type { SelectMonthProps } from './types';

export abstract class SelectMonthComponent extends Component<SelectMonthProps> {}

export class SelectMonth extends SelectMonthComponent {
  render() {
    const { readOnly, disabled, ...attrs } = this.props;
    if (attrs.value === null) {
      attrs.value = '';
    }
    return (
      <DatePicker {...attrs} mode="month" disabled={disabled || readOnly} />
    );
  }
}
