import { UserInfo } from "@/services/account/interface";
import { ActionKeys, namespace } from "./interface";

// 包裹命名空间
const withNamespace = <T extends (...args: any[]) => any>(fn: T): T => {
  const wrapper = (...args: any[]) => {
    const action = fn(...args);
    return {
      ...action,
      type: `${namespace}/${action.type}`
    };
  };
  return wrapper as T;
};

// 设置用户信息
export const setUserInfo = withNamespace((payload: UserInfo) => {
  return {
    type: ActionKeys.SetUserInfo,
    payload: payload
  }
});

// 获取用户信息
export const fetchUserInfo = withNamespace(() => {
  return {
    type: ActionKeys.FetchUserInfo
  }
});
