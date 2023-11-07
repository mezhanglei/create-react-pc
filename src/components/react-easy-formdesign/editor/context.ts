import EventBus from '@/utils/event-bus';
import React from 'react';
import { FormRenderStore, FormStore } from '../render';
import { ELementProps, FormDesignData } from '../render/components';
import { SelectedType } from '../render/components/BaseSelection';

// 表单编辑器的context
export interface FormEditorContextProps {
  editorForm?: FormStore;
  editor?: FormRenderStore;
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
  setContextValue: (params: Partial<FormEditorContextProps>) => void
}

// 表单状态的context
export const FormEditorContext = React.createContext<FormEditorContextProps>({});