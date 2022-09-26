import { concatMap, find, firstValueFrom, from, Observable } from "rxjs";
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
export type FormValidator = (value: any, callBack?: FormValidatorCallBack) => any | Promise<any>;

/*Validator类*/
export default class Validator {
  rulesMap: { [path: string]: FormRule[] };
  rules$Map: { [path: string]: Observable<FormRule> };
  errorsMap: { [path: string]: string | undefined };
  constructor() {
    this.getError = this.getError.bind(this)
    this.setError = this.setError.bind(this)
    this.resetError = this.resetError.bind(this)
    this.start = this.start.bind(this)
    this.add = this.add.bind(this)
    this.rulesMap = {};
    this.rules$Map = {};
    this.errorsMap = {};
  }

  add(path: string, rules?: FormRule[]) {
    if (rules === undefined) {
      if (this.rulesMap[path]) {
        delete this.rulesMap[path];
      }
      if (this.rules$Map[path]) {
        delete this.rules$Map[path]
      }
    } else {
      this.rulesMap[path] = rules;
      this.rules$Map[path] = from(rules)
    }
  }

  getError(path?: string) {
    if (path) {
      return this.errorsMap[path]
    }
  }

  setError(path: string, msg?: string) {
    if (!path) return;
    if (msg === undefined) {
      delete this.errorsMap[path]
    } else {
      this.errorsMap[path] = msg
    }
  }

  resetError() {
    this.errorsMap = {}
  }

  async start(path: string, value: any, removed?: boolean) {
    this.setError(path)
    if (removed) {
      this.add(path)
      this.setError(path)
      return;
    };
    const rules$ = this.rules$Map[path];
    if (rules$) {
      const source$ = rules$.pipe(concatMap((rule) => handleRule(rule, value)), find((message) => message && typeof message === 'string'))
      const message = await firstValueFrom(source$)
      this.setError(path, message)
      return message
    }
  }
}

// 处理单条规则
const handleRule = async (rule: FormRule, value: any) => {
  // 默认消息
  const defaultMessage = rule?.message;
  // 参与校验的字段
  const entries = Object.entries(rule)?.filter(([key]) => key !== 'message');

  for (let [ruleKey, ruleValue] of entries) {
    // 自定义校验
    if (ruleKey === 'validator' && typeof ruleValue === 'function') {
      const result = await ruleValue?.(value);
      // 校验结果
      return result === true ? defaultMessage : result;
      // 其他字段的校验，返回true表示报错
    } else if (validatorsMap[ruleKey]?.(ruleValue, value)) {
      return defaultMessage;
    }
  }
}