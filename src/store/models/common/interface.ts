import { UserInfo } from '@/services/account/interface';
import { Model } from '../interface';

export type CommonNamespace = 'common';
export const namespace: CommonNamespace = 'common';
export type CommonModel = Model<CommonNamespace, CommonState>;

export interface CommonState {
    userInfo?: UserInfo
}

export enum ActionKeys {
    FetchUserInfo = 'fetchUserInfo',
    SetUserInfo = 'setUserInfo'
}
