import { useMemo } from 'react'
import { validatorsMap } from './validate-rules'
export type FormRule = {
  required?: boolean
  pattern?: string
  whitespace?: boolean
  max?: number
  min?: number
  message?: string
  validator?: FormValidator
}
export type FormValidatorCallBack = (message?: string) => void
export type FormValidator = (value: any) => any | Promise<any>

export function useValidator() {
  return useMemo(() => new Validator(), [])
}

/*Validator类*/
export default class Validator {
  rulesMap: { [key: string]: FormRule[] }
  constructor() {
    this.rulesMap = {}
  }

  add(path: string, rules?: FormRule[]) {
    if (rules === undefined) {
      delete this.rulesMap[path]
    } else {
      this.rulesMap[path] = rules
    }
  }

  getRulesMap() {
    return this.rulesMap
  }

  async start(path: string, value: any, disabled?: boolean) {
    if (disabled) {
      delete this.rulesMap[path]
      return
    }
    const rules = this.rulesMap[path]
    // 表单校验处理规则
    const handleRule = async (rule: FormRule) => {
      // 默认消息
      const defaultMessage = rule?.message
      // 参与校验的字段
      const entries = Object.entries(rule)?.filter(([key]) => key !== 'message')

      for (let [ruleKey, ruleValue] of entries) {
        // 自定义校验
        if (ruleKey === 'validator') {
          const result = await (ruleValue as FormValidator)?.(value)
          // 校验结果
          if (result) {
            return result === true ? defaultMessage : result
          }
          // 其他字段的校验，返回true表示报错
        } else if (validatorsMap[ruleKey]?.(ruleValue, value)) {
          return defaultMessage
        }
      }
    }
    // 按rules的索引顺序执行，有结果则终止执行
    const messageList = await asyncSequentialExe(
      rules?.map((rule: FormRule) => () => handleRule(rule)),
      (msg: string) => msg
    )
    const currentError = messageList?.[0]
    return currentError
  }
}
