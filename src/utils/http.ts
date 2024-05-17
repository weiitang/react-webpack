/**
 * @module utils/http
 * 辅助数据请求的工具
 */

export function createPaginationData() {
  return {
    current: 0,
    pages: 0,
    size: 0,
    total: 0,
    records: [],
  };
}
