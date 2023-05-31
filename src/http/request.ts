import CreateRequest from './createRequest';
import Loader from "@/components/loader/index";
import { getToken, loginOut } from "@/core/session";
import { CustomConfig, HTTP_CODE, HTTP_CODE_MAP, HTTP_STATUS, HTTP_STATUS_MAP } from './config';
import { message } from 'antd';

// 请求体结构
export interface ResponseData {
  code?: HTTP_CODE;
  message?: string;
}

// 配置请求
const request = CreateRequest({
  headers: {
    Authorization: getToken()
  },
  startLoading: () => {
    Loader.start();
  },
  endLoading: () => {
    Loader.end();
  },
  // 处理响应码
  handleResult: (data: ResponseData) => {
    const code = data?.code;
    const msg = data?.message;
    if (code != HTTP_CODE.SUCCESS && code) {
      const msgRes = msg || HTTP_CODE_MAP[code]
      msgRes && message.info(msgRes);
    }
  },
  // 处理状态码
  handleStatus: (status, msg) => {
    if (status == HTTP_STATUS.NOLOGIN) {
      loginOut();
    }
    if (status == HTTP_STATUS.AUTH) {
      // loginOut();
    }
    const msgRes = msg || HTTP_STATUS_MAP[status]
    msgRes && message.info(msgRes);
  }
});

export default request;

/**
 * 提前设置配置值的request
 * @param extendConfig 
 * @returns 
 */
export const extend = (extendConfig: CustomConfig & { prefix?: string }) => {
  return (url: string, config: CustomConfig) => {
    const {
      prefix,
      ...rest
    } = extendConfig;
    const prefixValue = prefix || '';
    const newUrl = prefixValue ? prefixValue + url : url;
    return request(newUrl, { ...rest, ...config });
  };
};
