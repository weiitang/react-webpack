import { Component, useModelEffect } from '@core';
import type { ReactNode } from 'react';
import type { IFormProps } from './types';
import { FormProvider } from './form-provider';
import { SubmittingContext } from './context';

export class FormCommon<P = any> extends Component<IFormProps & P> {
  state = {
    submitting: false,
  };
  Renderer = this.Implement.bind(this);
  Render() {
    const {
      model,
      children,
      labelAlign,
      validateManually,
      validateStatus,
      settings,
      onSubmit,
      ...attrs
    } = this.props;
    const { Renderer } = this;
    const handleSubmit = () => {
      this.setState({ submitting: true });
      return Promise.resolve()
        .then(() => onSubmit?.())
        .finally(() => {
          this.setState({ submitting: false });
        });
    };

    // 模型有变化的时候，就直接重置提交按钮
    useModelEffect(model, () => {
      this.setState({ submitting: false });
    });

    return (
      <SubmittingContext.Provider value={this.state.submitting}>
        <FormProvider
          model={model}
          validateManually={validateManually}
          validateStatus={validateStatus}
          labelAlign={labelAlign}
          settings={settings}
        >
          <Renderer labelAlign={labelAlign} onSubmit={handleSubmit} {...attrs}>
            {children}
          </Renderer>
        </FormProvider>
      </SubmittingContext.Provider>
    );
  }

  // 实现的组件
  Implement<P extends IFormProps>(
    props: P & {
      labelAlign?: 'top' | 'left' | 'right';
      children?: any;
    }
  ): ReactNode;
  Implement(): never {
    throw new Error(`Form.Implement 必须被实现`);
  }
}
