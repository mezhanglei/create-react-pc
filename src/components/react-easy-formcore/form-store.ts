
import { asyncSequentialExe } from '@/utils/common';
import { deepCopy } from './utils/utils';
import { deepGet, deepSet } from '@/utils/object';
import { formListPath } from './form';
import { validatorsMap } from './rules-validator';

export type FormListener = { name: string, onChange: (name: string) => void }

export type FormValidatorCallBack = (message?: string) => void;

export type FormValidator = (value: any, callBack?: FormValidatorCallBack) => boolean | undefined | Promise<boolean>;

export type FormRule = { required?: boolean, message?: string; validator?: FormValidator }

export type FormRules<T = any> = { [key in keyof T]?: FormRule[] };

export type FormErrors<T = any> = { [key in keyof T]?: T[key] }

export type ValidateResult<T> = { error?: string, values: T }

export class FormStore<T extends Object = any> {
  private initialValues: Partial<T>

  private valueListeners: FormListener[] = []
  private errorListeners: FormListener[] = []

  private values: Partial<T>

  private formRules: FormRules

  private formErrors: FormErrors = {}

  public constructor(values: Partial<T> = {}, formRules?: FormRules<T>) {
    this.initialValues = values
    this.values = deepCopy(values)
    this.formRules = formRules || {}

    this.getFieldValue = this.getFieldValue.bind(this)
    this.setFieldValue = this.setFieldValue.bind(this)
    this.setFieldsValue = this.setFieldsValue.bind(this)
    this.setFieldRules = this.setFieldRules.bind(this)
    this.setFieldsRules = this.setFieldsRules.bind(this)
    this.reset = this.reset.bind(this)
    this.getFieldError = this.getFieldError.bind(this)
    this.setFieldError = this.setFieldError.bind(this)
    this.setFieldsError = this.setFieldsError.bind(this)
    this.validate = this.validate.bind(this)
    this.subscribeValue = this.subscribeValue.bind(this)
    this.subscribeError = this.subscribeError.bind(this)
  }

  // 更新表单中的校验规则
  public setFieldRules(name: string, rules?: FormRule[]) {
    if (!name) return;
    if (rules === undefined) {
      delete this.formRules[name]
    } else {
      this.formRules[name] = rules;
    }
  }

  // 设置表单中的校验规则
  public setFieldsRules(values: FormRules<T>) {
    this.formRules = deepCopy(values)
  }

  // 同步值的变化
  private notifyValue(name?: string) {
    if (name) {
      this.valueListeners.forEach((listener) => {
        if (listener?.name === name) {
          listener?.onChange && listener?.onChange(listener?.name)
        }
      })
    } else {
      this.valueListeners.forEach((listener) => listener.onChange(listener?.name))
    }
  }

  // 同步错误的变化
  private notifyError(name?: string) {
    if (name) {
      this.errorListeners.forEach((listener) => {
        if (listener?.name === name) {
          listener?.onChange && listener?.onChange(listener?.name)
        }
      })
    } else {
      this.errorListeners.forEach((listener) => listener.onChange(listener?.name))
    }
  }

  // 获取所有表单值，或者单个表单值,或者多个表单值
  public getFieldValue(name?: string | string[]) {
    return name === undefined ? { ...this.values } : deepGet(this.values, name)
  }

  // 更新表单值，单个表单值或多个表单值
  public async setFieldValue(name: string | { [key: string]: any }, value?: any, forbidError?: boolean) {
    if (typeof name === 'string') {
      // 设置值
      this.values = deepSet(this.values, name, value, formListPath);
      // 同步ui
      this.notifyValue(name);

      if (this.formRules?.[name]?.length) {
        // 校验规则
        await this.validate(name, forbidError);
      }
    } else if (typeof name === 'object') {
      await Promise.all(Object.keys(name).map((n) => this.setFieldValue(n, name?.[n])))
    }
  }

  // 设置表单值(覆盖更新)
  public async setFieldsValue(values: Partial<T>) {
    this.values = deepCopy(values);
    this.notifyValue();
  }

  // 重置表单
  public reset() {
    this.setFieldsError({});
    this.setFieldsValue(this.initialValues);
  }

  // 获取error信息
  public getFieldError(name?: string) {
    if (name) {
      return this.formErrors[name]
    } else {
      return this.formErrors
    }
  }

  // 更新error信息
  private setFieldError(name: string, value: any) {
    if (!name) return;
    if (value === undefined) {
      delete this.formErrors[name]
    } else {
      this.formErrors[name] = value
    }
    this.notifyError(name)
  }

  // 设置error信息(覆盖更新)
  private async setFieldsError(erros: FormErrors<T>) {
    this.formErrors = deepCopy(erros);
    this.notifyError();
  }

  // 校验整个表单或校验表单中的某个控件
  public async validate(): Promise<ValidateResult<T>>
  public async validate(name: string, forbidError?: boolean): Promise<string>
  public async validate(name?: string, forbidError?: boolean) {
    if (name === undefined) {
      const result = await Promise.all(Object.keys(this.formRules)?.map((n) => this.validate(n)))
      const currentError = result?.filter((message) => message !== undefined)?.[0]
      return {
        error: currentError,
        values: this.getFieldValue()
      }
    } else {
      if (forbidError === true) return;
      // 清空错误信息
      this.setFieldError(name, undefined);

      const value = this.getFieldValue(name);
      const rules = this.formRules[name];

      // 表单校验处理规则
      const handleRule = async (rule: FormRule) => {
        // 默认消息
        const defaultMessage = rule?.message || true;
        // 参与校验的字段
        const entries = Object.entries(rule)?.filter(([key]) => key !== 'message');

        for (let [ruleKey, ruleValue] of entries) {
          // 自定义校验
          if (ruleKey === 'validator') {
            let message;
            const flag = await (ruleValue as FormValidator)?.(value, (msg?: string) => {
              // callback方式校验
              if (msg) {
                message = msg;
              }
            });

            // 校验结果
            if (message) {
              return message;
            } else if (flag) {
              return defaultMessage;
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
      if (currentError) {
        this.setFieldError(name, currentError);
      }
      return currentError;
    }
  }

  // 订阅表单值的变动
  public subscribeValue(name: string, listener: FormListener['onChange']) {
    this.valueListeners.push({
      onChange: listener,
      name: name
    });
    return () => {
      this.valueListeners = this.valueListeners.filter((sub) => sub.name !== name)
    }
  }

  // 订阅表单错误的变动
  public subscribeError(name: string, listener: FormListener['onChange']) {
    this.errorListeners.push({
      onChange: listener,
      name: name
    });
    return () => {
      this.errorListeners = this.errorListeners.filter((sub) => sub.name !== name)
    }
  }
}
