import { isEmpty } from "@/utils/type";

// 必填校验
function required(ruleValue: any, value: any) {
    if (ruleValue === true) {
        if (isEmpty(value)) {
            return true;
        }
    }
}

// pattern 表达式校验
function pattern(ruleValue: RegExp | string, value: any) {
    if (ruleValue instanceof RegExp) {
        return !ruleValue.test(value);
    } else if (typeof ruleValue === 'string') {
        const _pattern = new RegExp(ruleValue);
        return !_pattern.test(value);
    }
}

// whitespace 包含空格时校验不通过, value为string类型时生效
function whitespace(ruleValue: boolean, value: any) {
    if (ruleValue === true && typeof value === 'string') {
        return /^\s+$/.test(value) || value === '';
    }
}

// max 校验 value为string类型时字符串最大长度；number 类型时为最大值；array 类型时为数组最大长度
function max(ruleValue: number, value: any) {
    if (typeof ruleValue === 'number') {
        if (typeof value === 'string' || value instanceof Array) {
            return value?.length > ruleValue;
        } else if (typeof value === 'number') {
            return value > ruleValue;
        }
    }
}

// min 校验 value为string类型时字符串最小长度；number 类型时为最小值；array 类型时为数组最小长度
function min(ruleValue: number, value: any) {
    if (typeof ruleValue === 'number') {
        if (value === undefined) return true;
        if (typeof value === 'string' || value instanceof Array) {
            return value?.length < ruleValue;
        } else if (typeof value === 'number') {
            return value < ruleValue;
        }
    }
}

// 导出校验方法
export const validatorsMap = {
    'required': required,
    'pattern': pattern,
    'whitespace': whitespace,
    'max': max,
    'min': min
};
