import EventBus from '@/utils/event-bus';
import React from 'react';
import { FormRenderStore, FormStore } from '../form-render';
import { ELementProps, FormDesignData } from '../form-render/components';
import { SelectedType } from '../form-render/components/BaseSelection';

// 表单编辑器的context
export interface FormDesignContextProps {
  designerForm?: FormStore;
  designer?: FormRenderStore;
  settingForm?: FormStore | null;
  eventBus?: EventBus;
  selected?: SelectedType;
  properties?: FormDesignData;
  components?: { [key: string]: ELementProps };
  settings?: { [key: string]: { [title: string]: FormDesignData } };
  historyData?: {
    index: number;
    maxStep: number;
    steps: Array<SelectedType>;
  },
  setDesignState: (params: Partial<FormDesignContextProps>) => void
}

// 表单状态的context
export const FormDesignContext = React.createContext<FormDesignContextProps>({});