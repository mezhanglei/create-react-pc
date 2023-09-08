import EventBus from '@/utils/event-bus';
import React from 'react';
import { FormRenderStore, FormStore, GeneratePrams } from '../form-render';
import { ELementProps } from '../form-render/components';
import { FormDesignData, ConfigSetting, ConfigSettingsType } from './configs';
export interface SelectedType {
  name?: GeneratePrams<ELementProps>['name']; // 节点表单字段
  path?: GeneratePrams<ELementProps>['path']; // 节点路径
  parent?: GeneratePrams<ELementProps>['parent']; // 路径父节点
  attributeName?: string; // 当前选中节点的属性路径
  field?: ELementProps; // 节点的field
  setting?: ConfigSetting; // 节点的属性区域表单
}

// 表单编辑器操作方法
export interface FormDesignCtxProps {
  designerForm?: FormStore;
  designer?: FormRenderStore;
  settingForm?: FormStore | null;
  eventBus?: EventBus;
  selected?: SelectedType;
  properties?: FormDesignData;
  components?: { [key: string]: ELementProps };
  settings?: ConfigSettingsType;
  historyData?: {
    index: number;
    maxStep: number;
    steps: Array<SelectedType>;
  }
}

export interface FormEditCtxProps {
  setEdit: (params: Partial<FormDesignCtxProps>) => void
}
// 表单设计器的context
export const FormDesignContext = React.createContext<FormDesignCtxProps>({});
// 编辑操作的context
export const FormEditContext = React.createContext<FormEditCtxProps>({ setEdit: () => { } })