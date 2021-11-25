import { getUserInfo } from '@/services/account';
import type { EffectPayload, ActionPayload } from './interface';
import { setUserInfo } from './actions';
import type { EffectsCommandMap } from 'dva';
import { AnyAction } from 'redux';

// 弹窗变量
let modal;

// 获取用户信息
export function* fetchUserInfo(_: AnyAction, effects: EffectsCommandMap): any {
    const res = yield effects.call(getUserInfo);
    return yield effects.put(setUserInfo(res?.data));
}