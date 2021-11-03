import { isEmpty } from "./type";

/**
 * 单例模式
 * @param {*} fn 目标函数
 * 使用方式: 1:先实例化一个对象 const newFn = getSingle(fn)
 *          2: 执行函数 newFn()
 */
export function getSingle(fn: any): any {
    let instance: any = null;
    return function () {
        if (!instance) {
            instance = fn.apply(getSingle, arguments);
        }

        return instance;
    };
}

/**
 * 实现缓存递归执行函数功能,原理是让已经执行过的函数的结果缓存起来,当再次想要执行时直接返回结果
 * @param {function} fn 递归调用的函数,且有返回值
 * @param {Object} cache 用来缓存的对象
 * 使用方法: 1: 实例化一个对象: const fn = cacheProxy(需要递归调用的函数)
 *           2: 执行递归函数:  fn()
 */
export function cacheProxy(fn: any, cache: {}): any {
    cache = cache || {};

    return function (arg: any) {
        //如果缓存数据中没有这个参数对应的值
        if (!cache.hasOwnProperty(arg)) {
            (cache as any)[arg] = fn(arg);
        }
        //缓存递归执行结果
        return (cache as any)[arg];
    };
};

/**
 * 防抖， 一段时间内没有再执行则执行完一次，否则重新执行
 * @param {*} fn 目标函数
 * 使用： 1. 实例化一个对象: const fn = debounce(函数)
 *        2. 执行fn()
 */
export function debounce(fn: any, time: number = 500): any {
    let timeout: any = null;
    return function (...args: any[]) {
        if (timeout !== null) clearTimeout(timeout);
        timeout = setTimeout(() => {
            fn.apply(this, args);
        }, time);
    };
};

/**
 * 节流, 一段时间只能执行一次
 * @param {*} fn 目标函数
 * 使用: 1. 实例化一个对象: const fn = throttle(函数)
 *       2. 执行fn()
 */
export function throttle(fn: any, time: number = 500): any {
    let timer: any = null;
    return function (...args: any[]) {
        if (!timer) {
            timer = setTimeout(function () {
                fn.apply(this, args);
                timer = null;
            }, time);
        }
    };
};

/**
 * 顺序执行数组中的函数或promise，返回对应的结果数组
 */
export const asyncSequentialExe = (queues: any[], forbidFn?: Function) => {

    // 包装成Promise
    const promiseWrapper = (x: Promise<any> | ((...rest: any[]) => any)) => {
        if (x instanceof Promise) { // if promise just return it
            return x;
        }
        if (typeof x === 'function') {
            // if function is not async this will turn its result into a promise
            // if it is async this will await for the result
            return (async () => await x())();
        }
        return Promise.resolve(x)
    }

    // 异步队列顺序执行，可以根据条件是否终止执行
    const results: any[] = [];
    return queues?.reduce((lastPromise, currentPromise, index) => {
        return lastPromise?.then(async (res: any) => {
            results.push(res);
            const valid = await forbidFn?.(res, results, index);
            if (valid) {
                return null;
            } else {
                return promiseWrapper(currentPromise)
            }
        });
    }, promiseWrapper(queues?.[0])).then((res: any) => Promise.resolve([...results, res]?.filter((val) => !isEmpty(val))));
};

// settimeout模拟的循环方法
export async function poll(fn: () => any, forbidFn: (val: any) => boolean, interval = 2500) {
    const resolver = async (resolve: (arg0: any) => void, reject: (arg0: any) => void) => {
        try {
            const result = await fn();
            // call validator to see if the data is at the state to stop the polling
            const valid = forbidFn(result);
            if (valid === true) {
                resolve(result);
            } else {
                setTimeout(resolver, interval, resolve, reject);
            }
        } catch (e) {
            // if validator returns anything other than "true" or "false" it stops polling
            reject(e);
        }
    };
    return new Promise(resolver);
}

