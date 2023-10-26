import { useContext, useEffect, useReducer, useState } from "react";
import { SelectedType } from "../form-render/components/BaseSelection";
import { FormDesignContext } from "./context";

// 模拟类似于 class component 的 setState
export const useSet = <T>(initState: T) => {
  const [state, setState] = useReducer((state: T, newState: any) => {
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

  return [state, setState];
};

// 表单设计器的context
export function useFormDesign() {
  const context = useContext(FormDesignContext);
  return context;
}

// 获取当前hover的内容
export function useHoverSelected() {
  const context = useContext(FormDesignContext);
  const [hoverSelected, setHoverSelected] = useState<SelectedType>();

  useEffect(() => {
    context.eventBus && context.eventBus.on('hover', (val: SelectedType) => {
      setHoverSelected(val);
    });
  }, []);

  return hoverSelected;
}
