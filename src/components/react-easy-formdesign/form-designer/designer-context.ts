import EventBus from '@/utils/event-bus';
import React from 'react';
import { FormRenderStore, FormStore, GeneratePrams } from '../form-render';
import { ELementProps, FormDesignData } from './components/configs';

// 拖拽区域的数据
export interface DndCollectionType {
  type?: string;
  path?: string;
  attributeName?: string
}
export interface SelectedType {
  name?: GeneratePrams<ELementProps>['name']; // 节点表单路径
  path?: GeneratePrams<ELementProps>['path']; // 节点路径
  field?: ELementProps; // 节点的field
  parent?: GeneratePrams<ELementProps>['parent']; // 路径父节点
  attributeName?: string; // 当前选中节点的属性路径
}

// 表单编辑器操作方法
export interface FormDesignCtxProps {
  designerForm: FormStore;
  designer: FormRenderStore;
  eventBus: EventBus;
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