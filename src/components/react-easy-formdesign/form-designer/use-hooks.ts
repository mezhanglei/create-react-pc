import { useMemo, useReducer } from "react";
import { FormRenderStore } from "../form-render";

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
    return { ...state, ...action };
  }, initState);

  const setClassState = (state: T) => {
    setState(state);
  };

  return [state, setClassState];
};

export function useFormDesignerStore() {
  return useMemo(() => new FormRenderStore(), [])
}