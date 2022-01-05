import { getUserInfo } from '@/services/account';
import { setUserInfo } from './actions';
import type { EffectsCommandMap } from 'dva';
import { AnyAction } from 'redux';
import { GetPromiseReturnType } from '../interface';

// 获取用户信息
export function* fetchUserInfo(_: AnyAction, effects: EffectsCommandMap)  {
    const res: GetPromiseReturnType<typeof getUserInfo> = yield effects.call(getUserInfo);
    yield effects.put(setUserInfo(res.data));
    return res;
}