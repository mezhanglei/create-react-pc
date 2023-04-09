import React from 'react';
import { FormRenderStore, FormStore } from '../form-render';
import { ELementProps, FormDesignData } from './components/configs';

export interface SelectedType {
  name?: string; // 当前节点
  parent?: string; // 路径父节点
  formparent?: string; // 表单父节点
  field?: ELementProps; // 节点的field
  attributeName?: string; // 当前选中节点的属性路径
  attributeData?: any; // 当前选中节点的属性
}

// 表单编辑器操作方法
export interface FormDesignCtxProps {
  designerForm: FormStore
  designer: FormRenderStore
  selected: SelectedType;
  historyData: {
    index: number;
    maxStep: number;
    steps: Array<SelectedType>;
  }
  mode?: string;
  settingsForm?: FormStore | null;
  properties: FormDesignData;
}

export interface FormEditCtxProps {
  setEdit: (params: Partial<FormDesignCtxProps>) => void
}
// 表单设计器的context
export const FormDesignContext = React.createContext<FormDesignCtxProps>({})
// 编辑操作的context
export const FormEditContext = React.createContext<FormEditCtxProps>({})