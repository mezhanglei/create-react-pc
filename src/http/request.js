import axios from "axios";
import { STATUS_ERROR, CODE_ERROR } from "./config";
import { message } from "antd";
import { myStorage } from "@/utils/cache";
import { loginOut, getToken } from "@/core/common";
import { trimParams } from "@/utils/character";
import Loader from "@/components/loader/index";
import { myBrowser } from "@/utils/brower";

// 开始loading
export function startLoading() {
    Loader.start();
}

// 结束loading
export function endLoading() {
    Loader.end();
}

// 实例化一个axios实例(浏览器自动设置content-type或者自己手动设置)
// 1.默认application/x-www-form-urlencoded, form表单默认的方式,提交的数据按照key1=val1&key2=val2的方式进行编码，key和val都进行了URL转码(只支持表单键值对,不支持二进制文件)
// 2.application/json,表示请求体中消息类型为序列化的json字符串
// 3.multipart/form-data; boundary=${分隔符},利用form表单设置mutiple时浏览器自动添加,专门用于有效的传输文件, 既可以上传二进制数据，也可以上传表单键值对
const http = axios.create({
    timeout: 1000 * 10,
    withCredentials: true,
    baseURL: process.env.MOCK ? '/mock' : ""
});


let pending = []; // 声明一个数组用于存储每个ajax请求的取消函数和ajax标识
let cancelToken = axios.CancelToken;
let removePending = (config) => {
    for (let p in pending) {
        if (pending[p].u === config.url + '&' + config.method) { //当当前请求在数组中存在时执行函数体
            pending[p].f(); // 执行取消操作
            pending.splice(p, 1); //把这条记录从数组中移除
        }
    }
}

/**
 * 响应状态异常的处理
 * @param {Number} status 表示响应状态码
 * @param {String} msg 表示响应的信息
 */
function statusError(status, msg) {
    if (status === 401) {
        loginOut();
    }
    status && message.info(STATUS_ERROR[status] || msg);
}

/**
 * 返回code异常处理
 * @param {Number} code 表示后台返回的code
 * @param {String} msg 表示后台返回的信息
 */
function resultError(code, msg) {
    if (code == 401) {
        loginOut();
    }
    code && message.info(CODE_ERROR[code] || msg);
}

// 请求拦截(axios自动对请求类型进行类型转换)
http.interceptors.request.use(
    (config) => {
        // 公共的请求参数
        const defaults = {
            // t: new Date().getTime()
        };
        // 公共headers
        config.headers["Authorization"] = getToken();

        // 请求参数处理
        if (!config.noTrim) {
            if (config.params) {
                config.params = Object.assign(trimParams(config.params), defaults);
                if (myBrowser() == "IE") {
                    // ie下get请求会缓存
                    config.params = { ...config.params, rand: Math.random() };
                }
            } else if (config.data) {
                config.data = Object.assign(trimParams(config.data), defaults);
            }
        }

        startLoading();
        removePending(config); // 重复的请求取消掉
        config.cancelToken = new cancelToken((c) => {
            // 这里的ajax标识我是用请求地址&请求方式拼接的字符串，当然你可以选择其他的一些方式
            pending.push({ u: config.url + '&' + config.method, f: c });
        });
        return config;
    },
    (error) => {
        endLoading();
        return Promise.reject(error);
    }
);

// 响应拦截(axios默认自动对响应请求进行类型转换)
http.interceptors.response.use(
    (response) => {
        if (response == null || response === undefined) {
            return null;
        }
        endLoading();
        // 响应
        const code = response.data && response.data.code;
        const msg = response.data && response.data.message;
        const result = response.data;
        // 响应异常提示
        if (code != 200) {
            resultError(code, msg);
        }
        removePending(response.config);  // 在一个ajax响应后再执行一下取消操作，把已经完成的请求从pending中移除
        return result;
    },
    (error) => {
        endLoading();
        let msg =
            error.response && error.response.data && error.response.data.message;
        const status = error.response && error.response.status;
        // 错误响应
        statusError(status, msg);
        return Promise.reject(error);
    }
);

// 转换调用http请求的方式：例如http.post({}).then(res={})
const request = {};
['get', 'post', 'delete', 'put'].map(item => {
    request[item] = function (configs) {
        return http({
            ...configs,
            method: item
        });
    };
});

export default request;
