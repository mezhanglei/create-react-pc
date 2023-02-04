import request from '@/http/request';
import { RequestResponse } from '../interface';
import { UserInfo } from './interface';

// 获取用户信息
export const getUserInfo = (): RequestResponse<UserInfo> => {
  return request.post('user/info');
};
