import React from 'react';
import { FormRenderStore, FormStore } from '../form-render';
import { ELementProps, FormDesignData } from './components/configs';

export interface SelectedType {
  name?: string; // 当前表单控件节点
  parent?: string; // 表单控件父节点
  field?: ELementProps; // 所在组件的field
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