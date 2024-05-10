export interface IPagination {
  /**
   * 当前页
   */
  current: number;
  /**
   * 总页数
   */
  pages: number;
  /**
   * 总条数
   */
  total: number;
  /**
   * 每页条数
   */
  size: number;

  /**
   * 所有数据条目
   * 受限于后端
   */
  records?: any[];
}

export interface FlowListItem {
  id: number;
  name: string;
  creator: string;
  createTime: string;
  updateTime: string;
  operator: string;
}

/**
 * 流程图列表
 */
export type FlowListModel = IPagination & {
  records: FlowListItem[];
};

export interface FlowListHistoryItem {
  id: number;
  name: string;
  creator: string;
  createTime: string;
}

/**
 * 发布历史
 */
export type FlowListHistoryModel = IPagination & {
  records: FlowListHistoryItem[];
};

export interface LogListItem {
  id: number;
  name: string;
  createTime: string;
}

/**
 * 流程图基本信息
 */
export interface FlowModelProps {
  /**
   * 所属模块
   */
  moduleId?: string;
  /**
   * 流程名称
   */
  name?: string;
  /**
   * 流程简介
   */
  intro?: string;
  /**
   * 流程图xml
   */
  content: string;
}
