import { Button as TdButton } from 'tdesign-react';
import { Empty } from './../index';
import './basic.less';

export default function EmptyDemo() {
  const tipsNode = (
    <div>
      暂无<span className="empty-text">数据</span>
    </div>
  );
  const operationNode = (
    <div>
      <TdButton>主要按钮</TdButton>
      <TdButton theme="success">主要按钮</TdButton>
    </div>
  );
  return (
    <div className="main">
      <div className="box box-empty">
        <Empty />
      </div>
      <div className="box box-tips">
        <Empty tips="暂无数据暂无数据暂无数据暂无数据暂无数据暂无数据暂无数据暂无数据" />
      </div>
      <div className="box box-tips">
        <Empty tips={tipsNode} />
      </div>
      <div className="box box-operation">
        <Empty>{<TdButton>主要按钮</TdButton>} </Empty>
      </div>
      <div className="box box-operation">
        <Empty>{operationNode}</Empty>
      </div>
    </div>
  );
}
