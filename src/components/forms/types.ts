import { Model, Meta } from 'tyshemo';
import type {
  PropsWithChildren,
  ReactElement,
  ReactNode,
  ForwardRefExoticComponent,
  ComponentType,
} from 'react';

export enum USER_STATUS {
  // 在职
  STAY = 1,
  // 离职
  LEAVE = 2,
  // 试用期
  PROBATION = 3,
  // 待入职
  PREPARE = 4,
  // 未入职
  OUTSIDE = 5,
}

export type IObj = {
  [key: string | number]: any;
};

export type IOption = {
  name: string;
  id: string;
  disabled?: boolean;
  children?: IOption[];
  content?: any;
  extra?: any;
  tags?: string[];
};

export type IOptionLevels = IOption[];

export type IUser = {
  /**
   * 用户ID
   */
  userId: number;
  /**
   * 中文名
   */
  userName: string;
  /**
   * 英文名
   */
  userNameEn: string;
  /**
   * 员工状态id 1 在职 2 离职 3 试用 8 待入职 9 未入职
   */
  statusId?: number;
  /**
   * 用户是否冻结
   */
  isFrozen?: number;
};

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

export interface DataSource<T = any, U = any[] | void> {
  readonly value: T;
  readonly params: U;
  readonly get: (U) => Promise<T>;
}

/**
 * FormContext 信息
 */
export interface IFormContext {
  /**
   * 模型实例
   */
  model?: Model;

  /**
   * 如果为true，表示需要对全部item进行错误提示，用于在执行完校验之后，对全部字段进行错误提示
   * 最终是否展示了错误提示，还要取决于字段是否存在校验错误，以及在开启validateManually时是否调用了setValidateStatus
   */
  validateStatus?: boolean;

  /**
   * 检查的方式，1表示需要开发者自己调用setChecked方法才能进行错误检查
   */
  validateManually?: boolean;

  /**
   * 继承自tdesign
   */
  labelAlign?: 'top' | 'left' | 'right';

  /**
   * 向表单内传递配置信息，用于在表单最顶层进行一些特定的配置，从而让表单内部拥有不一样的效果
   */
  settings?: {
    /**
     * 在开发环境下传入一个key，浏览器自动保存表单数据，刷新后恢复保存的数据
     */
    debugKey?: string;
    [key: string]: string | number | boolean;
  };
  /**
   * 禁用
   */
  disabled?: boolean;
}

/**
 * FormProvider props
 */
export type IFormProviderProps = PropsWithChildren<IFormContext>;

/**
 * 模型上的view
 */
export type IView = {
  label?: string;
  key: string;
  value: any;
  readonly: boolean;
  disabled: boolean;
  hidden: boolean;
  required: boolean;
  changed: boolean;
  placeholder?: string;
  errors: IError[];

  [key: string]: any;
};

/**
 * 字段属性
 */
export type IAttrs = {
  name: string;
  value: any;
  readOnly: boolean;
  disabled: boolean;
  hidden: boolean;
  required: boolean;
  placeholder?: string;
  maxLength?: number;
  minLength?: number;
  max?: number;
  min?: number;
  onChange: (v: any) => void;
};

export type IError = {
  name?: string;
  message: string;
};

/**
 * 传入names时，被传入的对应字段将会以 { key: view } 的形式给出
 */
export type IDeps = {
  [key: string]: IView;
};

/**
 * Field props
 */
export type IFieldProps = PropsWithChildren<{
  /**
   * 模型实例，不传的时候读取FormProvider提供的model，传入的时候使用该模型
   */
  model?: Model;
  /**
   * 字段名
   */
  name?: string;
  /**
   * 依赖的字段名，这些字段变化的时候会触发当前字段界面更新
   */
  names?: string[];
  /**
   * 当不知道具体字段名，无法传name时，可以传meta来动态查找出对应的name
   */
  meta?: Meta | (new () => Meta);
  /**
   * 同names, 同meta
   */
  metas?: (Meta | (new () => Meta))[];
  /**
   * 外部传入，以让field用于识别是否需要更新
   */
  effects?: any[];
  /**
   * 用于渲染的函数
   */
  render: (
    /**
     * 用于提供给交互组件渲染的信息，只包含react原生交互组件的属性信息
     */
    attrs: Partial<IAttrs>,
    /**
     * name对应的view
     */
    view?: Partial<IView>,
    /**
     * names对应的views
     */
    deps?: Partial<IDeps>,
    /**
     * 上下文信息
     */
    context?: Partial<IFormContext>
  ) => ReactElement;
  /**
   * 用于决定是否更新的函数。一个数组，当数组内的值发生变化时，表示需要更新内部视图。
   */
  // effects?: any[];
}>;

type IFormItemLocalContext = {
  /**
   * 如果 validateManually 设定为 true，那么你必须手动调用 setValidateStatus 来修改当前是否需要被检查的状态，
   * setValidateStatus(true) 表示要对数据进行检查，如果校验失败就会显示出错误提示语。
   * 一般用在需求要求输入框失焦onBlur才检查的情况下。
   */
  setValidateStatus: (check: boolean) => void;
};

export type FormItemComponent =
  | ForwardRefExoticComponent<Partial<IObj>>
  | ComponentType<Partial<IObj>>;
/**
 * FormItem props
 */
export type IFormItemProps<A extends IObj = IObj> = IFormContext &
  Omit<IFieldProps, 'render'> & {
    /**
     * 对attrs信息进行补充，补充的信息会被render的attrs或component的props接收到
     * 例如部分组件需要接收options，但原来的attrs只包含原生表单组件的共有部分，所以不包含options，此时你可以通过map将options加入到attrs中
     */
    map?: (view: Partial<IView>) => A;

    /**
     * 渲染函数
     */
    render?: (
      /**
       * 用于渲染的props信息，仅包含react原生组件的信息，可通过append对该信息进行补充
       */
      attrs: IAttrs,
      view?: Partial<IView>,
      deps?: Partial<IDeps>,
      context?: Partial<IFormContext & IFormItemLocalContext>
    ) => ReactElement;

    /**
     * 渲染函数
     */
    component?:
      | ForwardRefExoticComponent<Partial<IObj> & A>
      | ComponentType<Partial<IObj> & A>;
    /**
     * 传递给渲染函数的props
     */
    props?: IObj;

    /**
     * 是否展示必填标记
     */
    requiredMark?: boolean;

    /**
     * 用于提供字段更多操作的信息，出现在右上角，可以用来作为点击之后的进一步操作
     */
    action?:
      | string
      | ReactElement
      | ReactNode
      | ((view: IView) => string | ReactElement | ReactNode);

    /**
     * 出现在整个item下方，灰色字，作为对该项的详细补充
     */
    help?:
      | string
      | ReactElement
      | ReactNode
      | ((view: IView) => string | ReactElement | ReactNode);

    /**
     * 对字段的说明信息，一般在label右侧一个? icon作为补充
     */
    tips?: string | ((view: IView) => string);

    /**
     * 主动传入错误，在其他错误都不存在的时候，该错误会被使用
     */
    error?: string;
  };

/**
 * Form props
 */
export type IFormProps = PropsWithChildren<
  IFormContext & {
    onSubmit?: () => Promise<void> | void;
  }
>;

/**
 * 表单提交按钮，基于Form的提交状态，自动disabled，注意，Form的onSubmit需要异步
 */
export type ISubmitProps = PropsWithChildren<
  {
    disabled?: boolean;
  } & IObj
>;

// -------------------------------------------------------

/**
 * 基础属性，每个选项都必须支持
 */
export type FormComponentBaseProps = Partial<
  Pick<IAttrs, 'disabled' | 'hidden' | 'required'>
> & {
  /**
   * 禁用
   */
  disabled?: boolean;
  /**
   * 隐藏
   */
  hidden?: boolean;
  /**
   * 必填
   */
  required?: boolean;
  /**
   * 只读
   */
  readOnly?: boolean;
  /**
   * 输入提示语
   */
  placeholder?: string;
};
/**
 * 通用属性，部分输入框形式的选项都需要
 * 此处仅做声明，需要你手动传入，组件不一定实现这些能力
 */
export type FormComponentCommonProps = FormComponentBaseProps & {
  /**
   * 输入框前缀
   */
  prefix?: string;
  /**
   * 输入框后缀，文本输入框和数字数据框的效果不同
   */
  suffix?: string;
  /**
   * placeholder比较短，description更完整，当需要展开输入时会使用description作为placeholder
   */
  description?: string;
  /**
   * 展示的文案，当输入完成后，关闭输入框，展示输入结果的时候使用
   */
  text?: string;
  /**
   * 是否要以红色高亮，边框变红，有红色字提示信息
   */
  status?: 'error';

  className?: string;
  style?: React.CSSProperties;
};

export type FormComponent<T> = {
  /**
   * 用于FormItem做map
   */
  mapToProps?: (view: IView) => IObj;
} & ComponentType<PropsWithChildren<T>>;

// ----------------------------------

/**
 * 单行文本输入框
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export type InputComponent<O = {}> = FormComponent<InputComponentProp & O>;

export type InputComponentProp = FormComponentCommonProps & {
  maxLength?: number;
  minLength?: number;
  type: 'text' | 'url';
  value: string;
  ref?: any;
  onChange: (value: string) => void;
  onBlur?: (value: string, context) => void;
  autoFocus?: boolean;
};

/**
 * 多列文本输入框
 */
export type MultiInputComponent = FormComponent<
  Omit<FormComponentCommonProps, 'style'> & {
    maxLength?: number;
    minLength?: number;
    maxlength?: number;
    type: 'text' | 'url';
    value: string[];
    nowrap?: boolean;
    onChange: (value: string[]) => void;
  }
>;

/**
 * 数字输入框，带千分位格式化效果
 */
export type InputNumberProps = FormComponentCommonProps & {
  max?: number;
  min?: number;
  /**
   * 位数限制
   */
  limit?: string;
  value: number | string;
  onChange: (value: number) => void;
  onBlur?: (value: string | number) => void;
  onFocus?: (value: string | number) => void;
  onConfirm?: (value: number) => void;
  autoFocus?: boolean;
  separator?: string;
  maxlength?: number;
};
export type InputNumberComponent = FormComponent<InputNumberProps>;

/**
 * 多行文本输入框
 */
export type InputTextComponent = FormComponent<
  Omit<FormComponentCommonProps, 'prefix'> & {
    maxLength?: number;
    maxlength?: number;
    minLength?: number;
    value: string;
    rows?: number;
    /**
     * 是否禁止换行，如果为true，表示虽然用textarea可以展示多行内容，但是不能输入换行
     */
    nowrap?: boolean;
    onChange: (value: string) => void;
  }
>;

/**
 * 富文本编辑器
 */
export type InputRichComponent = FormComponent<
  FormComponentCommonProps & {
    value: string;
    onChange: (value: string) => void;
    /**
     * 用于上传图片等
     */
    module: any;
  }
>;

/**
 * 展示
 */
export type ShowTextComponent = FormComponent<
  FormComponentBaseProps & {
    value: string;
  }
>;

/**
 * 开关
 */
export type ToggleProps = FormComponentBaseProps & {
  value: 0 | 1;
  onChange: (value: 0 | 1) => void;
  options?: Array<{ id: 0 | 1; name: string }>;
};
export type ToggleComponent = FormComponent<ToggleProps>;

/**
 * 下拉，支持级联，通过children实现
 */
export type SelectProps = FormComponentCommonProps & {
  /**
   * 是否加载中
   */
  loading?: boolean;
  /**
   * 多选的情况下是数组
   */
  value: IOption | IOption[];
  /**
   * 多选的情况下把被选中的全部给到
   */
  onChange: (selected: IOption | IOption[]) => void;
  /**
   * 是否多选
   * 如果开启multiple，那么value必然是一个数组
   */
  multiple?: boolean;
  /**
   * 选项列表
   */
  options:
    | IOption[]
    | DataSource<IOption[], void>
    | Promise<IOption[]>
    | (() => Promise<IOption[]>);
  /**
   * 是否开启严格模块进行选择，严格模式下父级和子级是分开独立选项，点击父级时，在展开的同时，父级本身会被选中
   */
  strictly: boolean;
  /**
   * 自定义选项tips
   */
  tips?: (option: IOption) => ReactNode;
  className?: string;
};
export type SelectComponent = FormComponent<SelectProps>;

export type SelectTagsProps = SelectProps & {
  /**
   * 选中的value
   */
  value: IOption[];
  /**
   * 变化回调
   */
  onChange: (selected: IOption[]) => void;
  /**
   * 选项列表
   */
  options: IOption[] | DataSource<IOption[], void>;
};
export type SelectTagsComponent = FormComponent<SelectTagsProps>;

/**
 * 下拉级联，选择带层级的数据，适用于地点、行业等
 * 带层级逻辑，例如地点、行业，就是带层级的，它的值必须是IOptionLevels | IOptionLevels[]
 * 一定是使用级联选择器，且value必须是全路径IOptionLevels
 * 当然，也受multiple的控制，如果multiple为true，则值为IOptionLevels[]
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export type SelectLevelsComponent<T extends {} = {}> = FormComponent<
  FormComponentCommonProps & {
    /**
     * 多选的情况下是数组
     */
    value: IOptionLevels | IOptionLevels[];
    /**
     * 多选的情况下把被选中的全部给到
     */
    onChange: (selected: IOptionLevels | IOptionLevels[]) => void;
    /**
     * 是否多选
     * 如果开启multiple，那么value必然是一个数组
     */
    multiple?: boolean;
    /**
     * 选项列表
     */
    options: IOption[] | DataSource<IOption[], void>;

    valueMode?: 'onlyLeaf' | 'parentFirst' | 'all';

    checkStrictly?: boolean;
  } & T
>;

/**
 * 单选框组
 */
export type RadiosComponent = FormComponent<
  FormComponentBaseProps & {
    /**
     * 多选的情况下是数组
     */
    value: IOption;
    /**
     * 多选的情况下把被选中的全部给到
     */
    onChange: (selected: IOption) => void;
    /**
     * 选项列表
     */
    options: IOption[] | DataSource<IOption[], void>;
  }
>;

/**
 * 多选框组，注意，value是数组
 */
export type CheckboxesComponent = FormComponent<
  FormComponentBaseProps & {
    /**
     * 多选的情况下是数组
     */
    value: IOption[];
    /**
     * 多选的情况下把被选中的全部给到
     */
    onChange: (selected: IOption[]) => void;
    /**
     * 选项列表
     */
    options: IOption[] | DataSource<IOption[], void>;
  }
>;

/**
 * 选择公司组件
 * TODO 统一到SelectOrg上面
 */
type SearchCompanyGroup = {
  id: string;
  // 组名
  name: string;

  groupId?: string;
  // 该组对应的数据源
  source: DataSource<IPagination, [string, IPagination]>;
  // 定制该组渲染效果
  render?: (item: {
    name: string;
    [key: string]: any;
  }) => ReactElement | ReactNode;
};
export type SelectCompanyProps = FormComponentCommonProps & {
  // 分组信息
  groups: Array<SearchCompanyGroup>;
  /**
   * 当前公司简称，用于填充到输入框中
   */
  value: string;
  placeholder?: string;
  disabled?: boolean;
  /**
   * 使用默认footer的文案
   */
  footerText?: string;
  /**
   * footer按钮文案
   */
  footerBtnText?: string;
  /**
   * 选中或直接创建一个公司
   * @param name 公司名称
   * @param company 被选中公司
   */
  onChange: (
    name: string,
    /**
     * 被选中公司，根据group，可能返回的内容不同
     */
    company?: any,
    group?: SearchCompanyGroup
  ) => void;

  onFocus?: () => void;
};
export type SelectCompanyComponent = FormComponent<SelectCompanyProps>;

export type SelectOrgProps = FormComponentCommonProps & {
  // 分组信息
  groups: Array<{
    // 组id，在选中之后，可通过该id做下一步的判断
    id: string;
    // 组名
    name: string;
    // 该组对应的数据源
    source: DataSource<IPagination, [string, IPagination]>;
    // 定制该组渲染效果
    render?: (item: {
      name: string;
      [key: string]: any;
    }) => ReactElement | ReactNode;
  }>;

  /**
   * 当前机构简称，用于填充到输入框中
   */
  value: string;
  placeholder?: string;
  disabled?: boolean;

  /**
   * 选中或直接创建一个机构
   * @param name 机构名称
   * @param org 被选中机构
   */
  onChange: (
    name: string,
    // 如果org不存在，表示直接创建
    org?: {
      id?: string;
      // 来自group的id
      groupId: string;
      name: string;
      desc: string;
      region: string;
      industry: string;
      image: string;
    }
  ) => void;

  onFocus?: () => void;
};

/**
 * 选择日期
 */
export type SelectDateComponent = FormComponent<
  FormComponentCommonProps & {
    value: string;
    onChange: (date: string) => void;
  }
>;

/**
 * 选择日期
 */
export type SelectMonthProps = FormComponentCommonProps & {
  value: string;
  onChange: (date: string) => void;
};

/**
 * 选择日期区间
 */
export type SelectDateRangeComponent = FormComponent<
  FormComponentCommonProps & {
    value: [string, string];
    onChange: (range: [string, string]) => void;
  }
>;

/**
 * 选择星星，注意，后端是以option的形式给前端的
 */
export type SelectStarComponent = FormComponent<
  FormComponentBaseProps & {
    /**
     * 要注意，id必须是数值字符串
     */
    options: IOption[] | DataSource<IOption, void>;
    value: IOption;
    onChange: (item: IOption) => void;
  }
>;

export type SelectUserComponentProps = FormComponentCommonProps & {
  /**
   * 自定义字段所对应的code，从sever-hard-code.ts中去找
   * 基于该code获取对应配置好的roleId列表，再使用该列表传入给roles，此时不需要传roles
   */
  code?: string;
  /**
   * 角色范围
   * 传入从权限系统拿到的角色id列表
   */
  roles?: string[];

  /**
   * 员工状态
   */
  userStatus?: USER_STATUS;
  /**
   * 多选的情况下是数组
   */
  value: IUser | IUser[];
  /**
   * 多选的情况下把被选中的全部给到
   */
  onChange: (selected: IUser | IUser[]) => void;
  /**
   * 是否多选
   */
  multiple?: boolean;

  ref?: any;
  // 对搜索结果进行过滤
  userFilter?: (data: any) => any;
};
/**
 * 选择用户
 */
export type SelectUserComponent = FormComponent<
  SelectUserComponentProps & {
    /**
     * PC only
     */
    showPopupOnFocus?: boolean;
  }
>;

export type UploadFileProps = FormComponentBaseProps & {
  value: any & {
    // 文件夹是否为空，null表示情况不明，不予理会
    empty?: boolean;
  };
  onChange: (folder: { id: string; empty: boolean }) => void;
  module: any;
  /**
   * 上传框内展示的详细描述信息
   */
  description?: string;
  /**
   * 是否支持上传文件夹
   */
  canUploadFolder?: boolean;
  /**
   * 传给UploadFile的其他参数
   */
  params?: Record<string, any>;

  /**
   * 允许上传的文件最大体积
   */
  size?: number;
};
export type UploadFileComponent = FormComponent<UploadFileProps>;

export type UploadImageComponent = FormComponent<
  FormComponentBaseProps & {
    value: any;
    onChange: (image: any) => void;
    module: any;
  }
>;

export type SearchInputProps = FormComponentBaseProps & {
  value: IOption;
  onChange: (value: IOption) => void;
  source?: DataSource<IOption[], [string]>;
  content?: (option: IOption) => ReactElement;
  empty?: ReactElement;
  renderItem?: (option: IOption) => ReactElement;
};
export type SearchInputComponent = FormComponent<SearchInputProps>;

export type SearchSelectProps = FormComponentBaseProps & {
  value: IOption;
  onChange: (value: IOption) => void;
  onBlur?: (value: string) => void;
  // 某些清空下onBlur时 未选择 option的情况下希望保留输入的内容
  notClearInput?: boolean;
  onSubmit?: (value: IOption, text: string) => void;
  canSubmit?: boolean;
  source?:
    | DataSource<IOption[], [string, boolean?]>
    | ((keyword: string) => Promise<IOption[]>);
  // 当搜索不到结果时有时需要额外操作
  emptyButtonText?: string;
  onClickEmptyButton?: (value: string, selectFunc: any) => void;
  loading?: boolean;
};
export type SearchSelectComponent = FormComponent<SearchSelectProps>;

export type SelectProjectProps = SelectProps & {
  type: string;
};
export type SelectProjectComponent = FormComponent<SelectProjectProps>;
