
import { asyncSequentialExe } from '@/utils/common';
import { isEmpty } from '@/utils/type';
import { deepCopy, deepGetForm, deepSetForm } from './utils'

export type FormListener = { name: string, onChange: () => void }

export type FormValidatorCallBack = (message?: string) => void;

export type FormValidator = (value: any, callBack?: FormValidatorCallBack) => boolean | undefined | Promise<boolean>;

export type FormRule = { required?: boolean, message?: string; validator?: FormValidator }

export type FormRules<T> = { [key in keyof T]?: FormRule[] };

export type FormErrors<T> = { [key in keyof T]?: T[key] }

export type ValidateResult<T> = { error?: string, values: T }

export class FormStore<T extends Object = any> {
  private initialValues: Partial<T>

  private listeners: FormListener[] = []

  private values: Partial<T>

  private formRules: FormRules<T>

  private formErrors: FormErrors<T> = {}

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
    this.subscribe = this.subscribe.bind(this)
  }

  // 更新表单中的校验规则
  public setFieldRules(name: string, rules?: FormRule[]) {
    if (!name) return;
    this.formRules[name] = rules;
  }

  // 设置表单中的校验规则
  public setFieldsRules(values: FormRules<T>) {
    this.formRules = deepCopy(values)
  }

  // 触发所有订阅, 同步表单ui和数据
  private notify(name?: string) {
    if (name) {
      this.listeners.forEach((listener) => {
        if (listener?.name === name) {
          listener?.onChange && listener?.onChange()
        }
      })
    } else {
      this.listeners.forEach((listener) => listener.onChange())
    }
  }

  // 获取所有表单值，或者单个表单值,或者多个表单值
  public getFieldValue(name?: string | string[]) {
    return name === undefined ? { ...this.values } : deepGetForm(this.values, name)
  }

  // 更新表单值，单个表单值或多个表单值
  public async setFieldValue(name: any, value?: any) {
    if (typeof name === 'string') {
      // 设置表单值
      this.setFieldsValue(deepSetForm(this.values, name, value));
      // 同步ui
      this.notify(name)

      if (this.formRules?.[name]?.length) {
        // 校验规则
        await this.validate(name);
      }
    } else if (name) {
      await Promise.all(Object.keys(name).map((n) => this.setFieldValue(n, name[n])))
    }
  }

  // 设置表单值
  public async setFieldsValue(values: Partial<T>) {
    this.values = deepCopy(values);
  }

  // 重置表单
  public reset() {
    this.setFieldsError({});
    this.setFieldsValue(this.initialValues)
    this.notify()
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
  public setFieldError(name: string, value: any) {
    if (!name) return;
    if (value === undefined) {
      delete this.formErrors[name]
    } else {
      this.formErrors[name] = value
    }
  }

  // 设置error信息
  public async setFieldsError(erros: FormErrors<T>) {
    this.formErrors = deepCopy(erros);
  }

  // 校验整个表单或校验表单中的某个控件
  public async validate(): Promise<ValidateResult<T>>
  public async validate(name: string): Promise<string>
  public async validate(name?: string) {
    if (name === undefined) {
      const result = await Promise.all(Object.keys(this.formRules)?.map((n) => this.validate(n)))
      const currentError = result?.filter((message) => message !== undefined)?.[0]
      return {
        error: currentError,
        values: this.getFieldValue()
      }
    } else {
      // 清空错误信息
      this.setFieldError(name, undefined);
      this.notify(name)
      const value = this.getFieldValue(name);
      const rules = this.formRules[name];

      // 表单校验处理规则
      const handleRule = async (rule: FormRule) => {
        // 固定方式校验
        if (rule.required === true && isEmpty(value)) {
          return rule.message || true;
          // 自定义校验函数
        } else if (rule.validator) {
          let callbackExe;
          let message;
          const flag = await rule.validator(value, (msg?: string) => {
            // callback方式校验
            callbackExe = true;
            if (msg) {
              message = msg;
            }
          });

          // 校验结果
          if (callbackExe && message) {
            return message;
          } else if (flag) {
            return rule.message || true;
          }
        }
      }

      // 按rules的索引顺序执行，有结果则终止执行
      const messageList = await asyncSequentialExe(rules?.map((rule: FormRule) => () => handleRule(rule)), (msg: string) => msg);
      const currentError = messageList?.[0];
      if (currentError) {
        this.setFieldError(name, currentError);
        this.notify(name);
      }
      return currentError;
    }
  }

  // 订阅表单变动
  public subscribe(name: string, listener: FormListener['onChange']) {
    this.listeners.push({
      onChange: listener,
      name: name
    });
    return () => {
      this.listeners = this.listeners.filter((sub) => sub.name !== name)
    }
  }
}
