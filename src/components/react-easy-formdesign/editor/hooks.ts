import { useContext, useEffect, useReducer, useState } from "react";
import { SelectedType } from "../render/components/BaseSelection";
import { FormEditorContext } from "./context";

// 创建设计器的context参数
export const useSetContext = <T>(initState: T) => {
  const [context, setContextValue] = useReducer((state: T, newState: any) => {
    let action = newState;
    // 函数类型参数
    if (typeof newState === 'function') {
      action = action(state);
    }
    // {type: string, payload: unknown} 传参
    if (newState.type && newState.payload) {
      action = newState.payload;
      if (typeof action === 'function') {
        action = action(state);
      }
    }

    return Object.assign({}, state, action);

  }, initState);

  return Object.assign({ setContextValue }, context);
};

// 表单设计器的context
export function useFormEditor() {
  const context = useContext(FormEditorContext);
  return context;
}

// 获取当前hover的内容
export function useHoverSelected() {
  const context = useContext(FormEditorContext);
  const [hoverSelected, setHoverSelected] = useState<SelectedType>();

  useEffect(() => {
    context.eventBus && context.eventBus.on('hover', (val: SelectedType) => {
      setHoverSelected(val);
    });
  }, []);

  return hoverSelected;
}
