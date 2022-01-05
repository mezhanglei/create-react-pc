import { UserInfo } from '@/services/account/interface';
import type { ReducerHandler } from '../interface';

// 设置用户信息
export const setUserInfo: ReducerHandler<UserInfo> = (state, { payload }) => {
    return { ...state, userInfo: payload };
};