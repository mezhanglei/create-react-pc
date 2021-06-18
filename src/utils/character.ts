//===基础字符串或数字的处理===//
import { isObject, isNumber } from "./type";

//保留n位小数并格式化输出字符串类型的数据
export function formatFloat(value: number | string, n = 2) {
    if (typeof value === 'string') {
        value = parseFloat(value);
    } else if (!isNumber(value)) {
        return "";
    }
    // 浮点类型数字
    let numValue = Math.round(value * Math.pow(10, n)) / Math.pow(10, n);
    // 转为字符串
    let strValue = numValue.toString();
    // 小数点索引值
    let spotIndex = strValue.indexOf('.');
    // 没有点加个点
    if (spotIndex < 0 && n > 0) {
        spotIndex = strValue.length;
        strValue += '.';
    }
    while (strValue.length <= spotIndex + n) {
        strValue += '0';
    }
    return strValue;
}

// 自动补充0
export function prefixZero(num: number, len: number) {
    if (String(num).length > len) return num;
    return (Array(len).join(0) + num).slice(-len);
}

// 将数字或数字字符串转成百分比
export function numberToRate(value: number | string, n = 2) {
    if (value === undefined || value === '') {
        return '';
    }
    let num = typeof value === 'number' ? value : parseFloat(value);
    return formatFloat(num * 100, n) + '%';
}

// 对正整数循环除以10得到10的几次幂。
export function getPower(integer: number) {
    let power = -1;
    while (integer >= 1) {
        power++;
        integer = integer / 10;
    }
    return power;
}

/**
 * 将大数字转为带单位的数字, 
 * @param {*} number 数字
 * @param {String} unit 指定单位，默认 "万"
 * @param {Number} n 保留几位小数，默认保留2位
 */
export function unitChange(number: number | string, unit = "万", n = 2) {
    // if (!isNumber(number)) {
    //     number = parseFloat(number);
    // }
    if (typeof number === "string") {
        number = parseFloat(number);
    } else if (!isNumber(number)) {
        return;
    }
    // 单位对应十的几次幂的映射规则
    const unitMap = {
        "十": 1,
        "百": 2,
        "千": 3,
        "万": 4,
        "十万": 5,
        "百万": 6,
        "千万": 7,
        "亿": 8,
        "十亿": 9,
        "百亿": 10,
        "千亿": 11,
        "万亿": 12
    };
    // 目标数字首先向下取整
    let integer = Math.floor(number);
    // 十的几次幂 从0开始对应匹配单位个, 十, 百, 千, 万, 十万, 百万, 千万...
    let power = getPower(integer);
    // 当前单位对应的十的幂次
    const unitPower = unitMap[unit];
    if (power >= unitPower) {
        return formatFloat(number / Math.pow(10, unitPower), n) + unit;
    }
    return number;
}

/**
 * 递归去除参数的前后空格
 * @param {*} data 参数
 */
export const trimParams = (data: any) => {
    if (typeof data === 'string') return data.trim();
    if (isObject(data)) {
        for (let key in data) {
            data[key] = trimParams(data[key]);
        }
    }
    return data;
};

// 格式化text-area文本, 返回格式化后的字符串： 去空格，并实现换行
export const handleTextArea = (text: string) => {
    const arr: string[] = [];
    text.split('\n').forEach(item => arr.push(`<span>${item.trim()}</span>`));
    return arr.join('<br>');
};

// 隐藏手机号中间的四位数并返回结果
export function hideTelephone(phone: number | string) {
    phone = "" + phone;
    let reg = /(\d{3})\d{4}(\d{4})/;
    return phone.replace(reg, "$1****$2");
}

// 过滤富文本中的标签和空格，提取文本
export function richTextFilter(str: string) {
    // return str.replace(/<img [^>]*src=['"]([^'"]+)[^>]*>/g, '').replace(/&nbsp;/ig, '');
    return (str.replace(/<[^<>]+>/g, '').replace(/&nbsp;/ig, ''));
}

/**
 * 随机一定范围内的数字
 * @param max 最大值
 * @param min 最小值
 */
export function randomNumber(max = 1, min = 0) {
    if (min >= max) {
        return max;
    }
    return Math.floor(Math.random() * (max - min) + min);
}

/**
 * 生成GUID(全局唯一标识符32位，UUID的一种)
 * 其中4表示UUID生成算法版本
 */
export const getGUID = () => {
    let str = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
    return str.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}