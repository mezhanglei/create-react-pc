import { asyncSequentialExe } from "@/utils/common";
import { validatorsMap } from "./validate-rules";
export type FormRule = {
  required?: boolean;
  pattern?: string;
  whitespace?: boolean;
  max?: number;
  min?: number;
  message?: string;
  validator?: FormValidator
}
export type FormValidatorCallBack = (message?: string) => void;
export type FormValidator = (value: any, callBack?: FormValidatorCallBack) => boolean | undefined | Promise<boolean>;

/*Validator类*/
export default class Validator {
  rulesMap: { [key: string]: FormRule[] };
  constructor() {
    this.rulesMap = {};
  }

  add(path: string, rules?: FormRule[]) {
    if (rules === undefined) {
      delete this.rulesMap[path];
    } else {
      this.rulesMap[path] = rules;
    }
  }

  async start(path: string, value: any) {
    const rules = this.rulesMap[path];
    // 表单校验处理规则
    const handleRule = async (rule: FormRule) => {
      // 默认消息
      const defaultMessage = rule?.message;
      // 参与校验的字段
      const entries = Object.entries(rule)?.filter(([key]) => key !== 'message');

      for (let [ruleKey, ruleValue] of entries) {
        // 自定义校验
        if (ruleKey === 'validator') {
          let message;
          const result = await (ruleValue as FormValidator)?.(value, (msg?: string) => {
            // callback方式校验
            if (msg) {
              message = msg;
            }
          });

          // 校验结果
          if (message) {
            return message;
          } else if (result) {
            return result === true ? defaultMessage : result;
          }
          // 其他字段的校验，返回true表示报错
        } else if (validatorsMap[ruleKey]?.(ruleValue, value)) {
          return defaultMessage;
        }
      }
    }
    // 按rules的索引顺序执行，有结果则终止执行
    const messageList = await asyncSequentialExe(rules?.map((rule: FormRule) => () => handleRule(rule)), (msg: string) => msg);
    const currentError = messageList?.[0];
    return currentError;
  }
}
