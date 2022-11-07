import React, {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
  useState,
} from 'react';
import { useFormRenderStore, useFormStore } from '../react-easy-formrender';
import { FormRenderContext, FormEditContext } from './design-context';
import { useSet } from './use-hooks';

export interface ProviderProps {
  children: any;
}

function Provider(props: ProviderProps) {

  const designerStore = useFormRenderStore();
  const designerForm = useFormStore();

  const [state, setEdit] = useSet({
    isNewVersion: true,
    preview: false, // preview = false 是编辑模式
    properties: {}, // 表单的渲染数据
    formValues: {}, // 表单的值
    globalFormProps: {}, // 表单的全局属性
    selected: undefined, // 当前选中的路径
    settingsForm: null, // 当前属性面板的渲染表单
    operateIndex: undefined, // 记录栈中当前操作的序号
    operateHistory: [] // 缓存的操作记录栈
  });

  const {
    children
  } = props;

  const params = {
    designer: {
      store: designerStore,
      form: designerForm
    },
    ...state
  }

  return (
    <FormEditContext.Provider value={setEdit}>
      <FormRenderContext.Provider value={params}>{children}</FormRenderContext.Provider>
    </FormEditContext.Provider>
  );
}

export default Provider;