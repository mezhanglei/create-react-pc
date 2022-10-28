import React, {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
  useState,
} from 'react';
import { useFormRenderStore } from '../react-easy-formrender';
import { FormRenderContext, FormEditContext } from './design-context';
import { useSet } from './use-hooks';

export interface ProviderProps {
  children: any;
}

function Provider(props: ProviderProps) {

  const designer = useFormRenderStore();

  const [state, setEdit] = useSet({
    isNewVersion: true, // 用schema字段，还是用propsSchema字段，这是一个问题
    preview: false, // preview = false 是编辑模式
    schema: {}, // 表单的渲染数据
    formData: {}, // 表单的值
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
    designer,
    ...state
  }

  return (
    <FormEditContext.Provider value={setEdit}>
      <FormRenderContext.Provider value={params}>{children}</FormRenderContext.Provider>
    </FormEditContext.Provider>
  );
}

export default Provider;