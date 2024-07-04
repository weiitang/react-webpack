export interface StarsProps {
  /**
   * 展示类型
   * @default filled
   */
  type?: 'outline' | 'filled';
  /**
   * 最大星星数
   * @default 5
   */
  max?: number;
  /**
   * 当前星星数
   */
  value: number;
  /**
   * 尺寸
   * @default normal
   */
  size?: 'small' | 'normal' | 'large' | 'xlarge';
  /**
   * change事件
   * @default normal
   */
  onChange?: (value: number) => void;
  /**
   * 是否可编辑
   * @default false
   */
  editable?: boolean;
  className?: string;
  /**
   * active星 样式
   * @default false
   */
  activeClassName?: string;
}
