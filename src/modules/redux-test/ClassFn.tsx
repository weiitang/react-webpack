/* eslint-disable no-console */
import React, { Component } from 'react';
import { connect } from 'react-redux';
// import { instance } from './../http/base';

// const root = document.querySelector('#root');
import { Dispatch, RootState } from '../../../model';
interface ClassFnPropsType {
  test: string;
  pendingCount: number;
  getPendingCountReq: () => {};
}

class ClassFn extends Component<ClassFnPropsType> {
  constructor(props: ClassFnPropsType) {
    super(props);
  }

  modelOnclick = () => {
    // dispatch.global.getPendingCountReq();
    const { test, pendingCount, getPendingCountReq } = this.props;
    getPendingCountReq();
    console.log('test', test, pendingCount);
  };

  render() {
    const { pendingCount } = this.props;

    return (
      <div className="root">
        <span onClick={this.modelOnclick}>点我</span>
        <span>{pendingCount}</span>
      </div>
    );
  }
}

const mapState = (state: RootState) => {
  return { ...state.global };
};

const mapDispatch = (dispatch: Dispatch) => {
  return { ...dispatch.global };
};

export default connect(mapState, mapDispatch)(ClassFn);
