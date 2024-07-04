import type { IOptions } from '@src/typings/type';
type Params = { value: number; desc: string };
export interface StarSelectProp {
  /**
   * 最大几颗星
   * @default 4
   */
  max?: number;
  /**
   * 受控值
   */
  value?: number | number[];
  /**
   * 默认值，不受控
   */
  defaultValue?: number | number[];
  /**
   * 如果传了 options，则value和desc,max从options中取
   */
  options?: IOptions;
  /**
   * 是否展示星级后的tips，空则不展示
   * @default ['优', '良', '中', '差']
   */
  desc?: string[];
  /**
   * 是否多选
   * @default false
   */
  multiple?: boolean;
  /**
   * 回调
   */
  onChange?: (params: Params | Params[]) => void;
  /**
   * placeholder
   */
  placeholder?: string;
  /**
   * 折叠已选项
   */
  minCollapsedNum?: number;
  disabled?: boolean;
  clearable?: boolean;
  className?: string;
}
