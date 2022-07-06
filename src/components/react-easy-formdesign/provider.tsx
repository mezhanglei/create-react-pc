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

  const formRenderStore = useFormRenderStore();

  const [state, setEdit] = useSet({
    frProps: {}, // form-render 的全局 props 等
    isNewVersion: true, // 用schema字段，还是用propsSchema字段，这是一个问题
    preview: false, // preview = false 是编辑模式
    schema: {}, // 表单的渲染数据
    formData: {}, // 表单的值
    selected: undefined, // 选中的路径
  });

  const {
    children
  } = props;

  const params = {
    formRenderStore,
    ...state
  }

  return (
    <FormEditContext.Provider value={setEdit}>
      <FormRenderContext.Provider value={params}>{children}</FormRenderContext.Provider>
    </FormEditContext.Provider>
  );
}

export default Provider;