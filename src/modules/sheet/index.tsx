/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-param-reassign */
import {
  cloneDeep,
  merge,
  unset,
  omit,
  isNumber,
  isArray,
  groupBy,
  isString,
} from 'lodash';

export const scriptsUrlList = [
  `/static/luckysheet/plugins/js/plugin.js`,
  `/static/luckysheet/luckysheet.umd.js`,
];

const DEFAULT_CONFIG = {
  title: 'sheet',
  container: 'luckysheet',
  lang: 'zh',
  row: 40,
  column: 30,
  plugins: [
    {
      name: 'chart',
      config: { baseUrl: `/${process.env.STATIC_DIR_NAME}/luckysheet/` },
    },
    // { name: 'exportXlsx', config: { url: 'http://localhost:3002/luckyToXlsx' } },
    // {
    //   name: 'print',
    //   config: {
    //     license: '',
    //   },
    // },
  ],
  // showsheetbar: false, // 是否显示底部sheet页按钮
  // 自定义配置底部sheet页按钮
  showsheetbarConfig: {
    add: true,
    menu: false,
    sheet: true,
  },

  showinfobar: false, // 是否显示顶部信息栏
  enableAddRow: false, // 允许添加行
  enableAddBackTop: false, // 允许回到顶部
  allowEdit: true, // 允许编辑
  // 工具栏配置
  showtoolbarConfig: {
    textRotateMode: false, // '文本旋转方式'
    image: false, // '插入图片'
    splitColumn: false, // '分列'
    screenshot: false, // '截图'
    protection: false, // '工作表保护'
    print: false, // '打印'
    exportXlsx: false, // '导出excel'
    postil: false, // '批注'
  },
  // 自定义配置单元格右击菜单
  cellRightClickConfig: {
    // copy: false, // 复制
    // copyAs: false, // 复制为
    // paste: false, // 粘贴
    // insertRow: false, // 插入行
    // insertColumn: false, // 插入列
    // deleteRow: false, // 删除选中行
    // deleteColumn: false, // 删除选中列
    // deleteCell: false, // 删除单元格
    // hideRow: false, // 隐藏选中行和显示选中行
    // hideColumn: false, // 隐藏选中列和显示选中列
    // rowHeight: false, // 行高
    // columnWidth: false, // 列宽
    // clear: false, // 清除内容
    matrix: false, // 矩阵操作选区
    // sort: false, // 排序选区
    // filter: false, // 筛选选区
    // chart: false, // 图表生成
    image: false, // 插入图片
    // link: false, // 插入链接
    // data: false, // 数据验证
    // cellFormat: false, // 设置单元格格式
    // customs: [
    //   {
    //     title: 'test',
    //     onClick(clickEvent, event, params) {
    //       console.log('function test click', clickEvent, event, params);
    //       const range = luckysheet.getRange();
    //       console.log('range---->>', range);
    //       const rangeWithFlatten = luckysheet.getRangeWithFlatten();
    //       console.log('rangeWithFlatten---->>', rangeWithFlatten);
    //     },
    //   },
    // ],
  },
  // 自定义配置sheet页右击菜单
  sheetRightClickConfig: {
    delete: true, // 删除
    copy: false, // 复制
    rename: true, // 重命名
    color: false, // 更改颜色
    hide: false, // 隐藏，取消隐藏
    move: false, // 向左移，向右移
  },
};

const DEFAULT_DATA = [
  {
    name: '模板设置',
    color: '',
    index: '__null',
    status: 0,
    order: 0,
    celldata: [],
    config: null,
    // showGridLines: 0,
  },
];

type DataItem = {
  c: number;
  r: number;
  index: string;
  cell: any;
};

export enum ROLE {
  root = 'root', // 管理员
  audit = 'audits', // 审核人
  dl = 'dls', // DL
  follower = 'followers', // 补充跟进人
  writer = 'writers', // 填写人
}

// 记录状态枚举
export enum SHEET_STATUS {
  draft = 'draft', // 待确认模板
  new = 'new', // 未打开
  filling = 'filling', // 填写中
  pending = 'pending', // 已提交待确认
  passed = 'passed', // 已完成
  refused = 'refused', // 待重新提交
}

export const STATUS_TEXT = Object.freeze({
  [SHEET_STATUS.draft]: '待确认模板',
  [SHEET_STATUS.new]: '未打开',
  [SHEET_STATUS.filling]: '填写中',
  [SHEET_STATUS.pending]: '已提交待确认',
  [SHEET_STATUS.passed]: '已完成',
  [SHEET_STATUS.refused]: '待重新提交',
});

type RangeItemType = {
  endCol: number;
  endRow: number;
  startCol: number;
  startRow: number;
};

export type SheetProps = {
  // 初始化的表格配置
  config?: any;
  // 初始化的表格数据
  data?: any[];
  // 角色 root dl user 默认user
  role?: ROLE;
  // 可输入区域
  allowedRange?: Record<string, RangeItemType[]>;
  // 当前表格版本
  version?: string;
  // 容器id
  id?: string;
  // 语言
  language?: 'zh' | 'en';
};

export class SheetBase {
  // 是否只读
  readonly = false;
  // 当前表格版本
  version!: string;
  // 表格数据
  data: any[] = [];
  // 表格配置
  config: any;
  // 容器的id
  readonly _id = 'luckysheet';
  // 角色
  role?: ROLE;
  // 可输入区域
  allowedRange?: Record<string, RangeItemType[]>;
}
class SheetModel extends SheetBase {
  constructor(props: SheetProps, readonly?: boolean) {
    super();

    this.version = '0';
    this.data = [];
    this.config = DEFAULT_CONFIG;
    this.allowedRange = {};
    this.role = undefined;
    this.readonly = readonly || false;
    this.init(props);
  }

  init(props?: SheetProps) {
    const { data, config, role, language } = props || {};
    const newData = data?.length ? data : DEFAULT_DATA;
    this.config = merge(
      this.config,
      cloneDeep(config),
      this.readonly ? { editMode: true, allowEdit: false } : {}
    );
    if (language === 'en') {
      this.config.lang = 'en';
    }
    role && (this.role = role);
    this.allowedRange = {};

    // 如果role是root添加一些自定义按钮
    /* if (role === ROLE.root) {
      set(newConfig, 'cellRightClickConfig.customs', [
        {
          title: '设置为可填区域',
          onClick(clickEvent, event, params) {
            const range = luckysheet.getRange();
            const rangeWithFlatten = luckysheet.getRangeWithFlatten();
          },
        },
      ]);
    } else if (role === ROLE.dl) {
      unset(newConfig, 'cellRightClickConfig.customs');
    } else {
      unset(newConfig, 'cellRightClickConfig.customs');
    } */

    // 如果是用户，需要控制输入区域
    this.data = this._parseDataThroughAllowedRange(newData);
    luckysheet.destroy();
    luckysheet.create({ ...this.config, data: this.data, container: this._id });
  }

  refresh(props: SheetProps) {
    const {} = props;
  }

  getSheetJson = () => {
    const config = luckysheet.toJson();
    const data = this.getSheetData();
    return {
      ...config,
      data,
    };
  };

  getSheetData = () => {
    const json = luckysheet.toJson();
    if (!json.data) {
      return [];
    }
    // 把编辑区域设置到数据中
    return json.data?.map((item) => {
      const result = item;
      const range = this.allowedRange?.[result.index];
      if (isArray(range) && range?.length) {
        result.editable = {
          zones: range,
        };
      }
      // 目前单元格的InlineString类型后端不支持，把该结构改为普通的string结构
      result.celldata = result?.celldata?.map((cell) => {
        if (cell?.v?.ct?.t === 'inlineStr') {
          const text = cell?.v?.ct?.s?.reduce((prev, cur) => prev + cur.v, '');
          const style = omit(cell?.v?.ct?.s?.[0], 'v');
          return {
            ...cell,
            v: {
              ...(cell?.v || {}),
              ct: {
                fa: 'General',
                t: 'g',
              },
              m: text,
              v: text,
              // 取第一个元素的样式覆盖原样式
              ...(style || {}),
            },
          };
        }
        return cell;
      });
      // data属性后端不需要
      delete result.data;
      return {
        ...result,
        // 把表格重新定位在左上
        scrollLeft: 0,
        scrollTop: 0,
      };
    });
  };

  // 更新数据但 只能更新sheet内存在的单元格
  updateData(data: DataItem[]) {
    if (!data?.length) {
      return;
    }
    const groupData = groupBy(data, 'index');
    Object.keys(groupData)?.forEach((key) => {
      const itemArr = groupData[key];
      const index = SheetModel.utils.getSheetIndex(key);
      const matchIndexData = this.data[index]?.data;
      itemArr?.forEach((item) => {
        if (matchIndexData?.[item.r]?.[item.c] !== undefined) {
          matchIndexData[item.r][item.c] = item.cell;
        }
      });
    });
    const newData = this.data?.map((item) => omit(item, 'celldata'));
    luckysheet.updataSheet({ data: newData });
  }

  setRole(value) {
    this.role = value;
    this.init();
  }

  updateConfig(config) {
    const json = luckysheet.toJson();
    const originConfig = omit(json, 'data');
    this.config = merge(originConfig, config);
    this.data = json.data;
    luckysheet.destroy();
    setTimeout(() => {
      luckysheet.create({
        ...this.config,
        data: this.data,
        container: this._id,
      });
    }, 0);
  }

  showRangeDialog = (rangeText, callback) => {
    const currentIndex = luckysheet.getCurrentSheetIndexString();
    luckysheet.showSelectionRangeDialog(rangeText, (txt) => {
      callback?.(txt, currentIndex);
    });
  };

  setRange = () => {
    const currentSheetRange = this._getCurrentSheetRange();
    const rangeText = luckysheet.getTxtByRange(currentSheetRange) || '';
    this.showRangeDialog(rangeText, this._setCurrentSheetRange);
  };

  showRange = () => {
    const currentSheetRange = this._getCurrentSheetRange();
    luckysheet.showSelectionCopy(currentSheetRange);
  };

  importExcel(_data, isCover) {
    const originData = this.getSheetData();
    // name需要去重
    const nameSet = new Set();
    originData?.forEach((item) => {
      nameSet.add(item.name);
    });
    const importData = _data.map((item, index) => {
      let incrementIndex = 1;
      // id需要特定格式
      let uniIndex = luckysheet.generateRandomSheetIndex();
      // 覆盖时 第一个sheet的index保持不变
      if (isCover && index === 0 && originData?.[0]?.index) {
        uniIndex = originData[0].index;
      }
      let { name } = item;
      if (nameSet?.has(name)) {
        while (nameSet?.has(`${name}${incrementIndex}`)) {
          incrementIndex += 1;
        }
        name = `${name}${incrementIndex}`;
      }
      nameSet?.add(name);
      return {
        ...item,
        name,
        calcChain:
          item?.calcChain?.map((chain) => ({
            ...chain,
            index: uniIndex,
          })) || [],
        index: uniIndex,
      };
    });

    // 组装数据新数据，业务要求只覆盖第一个sheet 其他都是新增
    let newData;
    if (isCover) {
      const firstItem = importData[0];
      const originItems = originData?.slice(1) || [];
      const importItems = importData?.slice(1) || [];
      newData = [firstItem, ...originItems, ...importItems];
    } else {
      newData = [...originData, ...importData];
    }

    // order重新设置顺序，避免导入多次的order重复问题
    newData = newData?.map((item, index) => ({ ...item, order: index }));
    this.init({ data: newData });
  }

  private _getCurrentSheetRange = () => {
    const currentIndex = luckysheet.getCurrentSheetIndexString();
    const range = this.allowedRange?.[currentIndex] || [];
    // 转换格式为luckysheet需要
    return range?.map((item) => ({
      column: [item.startCol, item.endCol],
      row: [item.startRow, item.endRow],
      sheetIndex: currentIndex,
    }));
  };

  private _setCurrentSheetRange = (rangeText: string, currentIndex: string) => {
    const range = luckysheet.getRangesByTxt(rangeText);
    // 转换格式为后端储存格式
    this.allowedRange[currentIndex] = range?.map((item) => ({
      endCol: item.column[1],
      endRow: item.row[1],
      startCol: item.column[0],
      startRow: item.row[0],
    }));
  };

  private _parseDataThroughAllowedRange(data) {
    if (data?.length === 0) {
      return data;
    }
    return data?.map((item) => {
      const newItem = item;
      // fix后端返回的类型错误
      if (
        isString(newItem.zoomRatio) &&
        !isNaN(parseFloat(newItem.zoomRatio))
      ) {
        newItem.zoomRatio = parseFloat(newItem.zoomRatio);
      }
      if (!item?.editable?.zones?.length) {
        return newItem;
      }
      this.allowedRange[newItem.index] = newItem?.editable?.zones;
      // 填写人角色 data中加入保护区域的边框
      if (this.role === ROLE.writer) {
        const range = this.allowedRange?.[newItem.index]?.map((rangeItem) => ({
          column: [rangeItem.startCol, rangeItem.endCol],
          row: [rangeItem.startRow, rangeItem.endRow],
          sheetIndex: newItem.index,
        }));
        const protectionTxt = luckysheet.getTxtByRange(range);
        const rangeDetail = luckysheet.getRangeDetailInfoArr(range);
        const borderInfo = {
          borderType: 'border-outside',
          color: '#0751DF',
          range: rangeDetail,
          rangeType: 'range',
          style: '4',
          _protection: true,
        };
        if (Array.isArray(item.config?.borderInfo)) {
          newItem.config.borderInfo.push(borderInfo);
        } else {
          if (!item.config) {
            newItem.config = {};
          }
          newItem.config.borderInfo = [borderInfo];
        }

        if (newItem.config.authority) {
          newItem.config.authority.allowRangeList.push({
            name: protectionTxt,
            password: '',
            hintText: '',
            algorithmName: 'None',
            saltValue: null,
            checkRangePasswordUrl: null,
            sqref: protectionTxt,
          });
        } else {
          newItem.config.authority = {
            password: '',
            algorithmName: 'None',
            saltValue: null,
            hintText: '',
            sheet: 1,
            selectLockedCells: 1,
            selectunLockedCells: 1,
            formatCells: 1,
            formatColumns: 1,
            formatRows: 1,
            insertColumns: 1,
            insertRows: 1,
            insertHyperlinks: 1,
            deleteColumns: 1,
            deleteRows: 1,
            sort: 1,
            filter: 1,
            usePivotTablereports: 1,
            editObjects: 1,
            editScenarios: 1,
            allowRangeList: [
              {
                name: protectionTxt,
                password: '',
                hintText: '',
                algorithmName: 'None',
                saltValue: null,
                checkRangePasswordUrl: null,
                sqref: protectionTxt,
              },
            ],
          };
        }
      } else {
        // 其他角色去掉
        if (Array.isArray(newItem.config?.borderInfo)) {
          newItem.config.borderInfo = newItem?.config?.borderInfo?.filter(
            (item) => !item._protection
          );
        }
        // 去掉保护区域
        unset(newItem, 'config.authority');
      }

      return newItem;
    });
  }

  // 工具方法
  static utils = {
    // 列下标  数字转字母
    chatatABC(_n) {
      const orda = 'a'.charCodeAt(0);
      const ordz = 'z'.charCodeAt(0);
      const len = ordz - orda + 1;
      let s = '';
      let n = _n;

      while (n >= 0) {
        s = String.fromCharCode((n % len) + orda) + s;
        n = Math.floor(n / len) - 1;
      }

      return s.toUpperCase();
    },

    // 单元格选中到指定位置
    setRangeShow(
      rangeText: any,
      setting?: { show?: boolean; sheetIndex?: string; succuess?: () => void }
    ) {
      const currentIndex = luckysheet.getCurrentSheetIndexString();
      // 判断是否是当前sheet  不是的话切换
      if (setting?.sheetIndex && currentIndex !== setting?.sheetIndex) {
        const index = luckysheet.getSpecifiedSheetIndex(setting?.sheetIndex);
        if (isNumber(index)) {
          luckysheet.setSheetActive(index);
        }
      }
      setTimeout(() => {
        luckysheet.setRangeShow(rangeText, setting);
      }, 0);
    },

    // 获取特定index在数组中的下标
    getSheetIndex(indexString: string) {
      return luckysheet.getSpecifiedSheetIndex(indexString);
    },
  };
}

export { SheetModel };

type LuckSheetProps = {
  height?: number;
  model?: SheetModel;
};
export const LuckSheet = (props: LuckSheetProps) => {
  const { model, height } = props;
  return (
    <div
      style={{
        display: 'flex',
        flex: 1,
        height: height ?? 850,
        position: 'relative',
      }}
    >
      <div
        id="luckysheet"
        style={{
          margin: 0,
          padding: 0,
          // position: 'absolute',
          width: '100%',
          height: '100%',
          // left: '0px',
          // top: '0px',
        }}
      ></div>
    </div>
  );
};
