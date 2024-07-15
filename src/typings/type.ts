export interface OptionsItem {
  name: string;
  id: string;
  parentId: null | string;
  weight: number;
  children?: OptionsItem[];
}

export type IOption = {
  name: string;
  id: string;
  disabled?: boolean;
  children?: IOption[];
  content?: any;
  extra?: any;
  tags?: string[];
};

export type IOptions = OptionsItem[];

export type IObj = {
  [key: string | number]: any;
};
