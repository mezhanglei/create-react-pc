
import { asyncSequentialExe } from '@/utils/common';
import { isExitPrefix } from './utils/utils';
import deepCopy from 'fast-copy';
import { deepGet, deepSet } from '@/utils/object';
import { formListPath } from './form';
import { validatorsMap } from './rules-validator';

export type FormListener = { name: string, onChange: (newValue?: any, oldValue?: any) => void }

export type FormValidatorCallBack = (message?: string) => void;

export type FormValidator = (value: any, callBack?: FormValidatorCallBack) => boolean | undefined | Promise<boolean>;

export type FormRule = { required?: boolean, message?: string; validator?: FormValidator }

export type FormErrors<T = any> = { [key in keyof T]?: T[key] }

export type ValidateResult<T> = { error?: string, values: T }

export type FieldProps = { rules?: FormRule[], [other: string]: any };

export type FormFieldsProps<T = any> = { [key in keyof T]: FieldProps }

export class FormStore<T extends Object = any> {
  private initialValues: Partial<T>

  private valueListeners: FormListener[] = []

  private storeValueListeners: FormListener[] = []

  private errorListeners: FormListener[] = []

  private propsListeners: FormListener[] = []

  private values: Partial<T>
  private lastValues?: Partial<T>

  private formErrors: FormErrors = {}

  private fieldsProps: FormFieldsProps = {};

  public constructor(values: Partial<T> = {}, fieldsProps?: FormFieldsProps<T>) {
    this.initialValues = values
    this.values = deepCopy(values)
    this.fieldsProps = fieldsProps || {};

    this.getFieldValue = this.getFieldValue.bind(this)
    this.setFieldValue = this.setFieldValue.bind(this)
    this.setFieldsValue = this.setFieldsValue.bind(this)
    this.getFieldError = this.getFieldError.bind(this)
    this.setFieldError = this.setFieldError.bind(this)
    this.setFieldsError = this.setFieldsError.bind(this)

    this.getFieldProps = this.getFieldProps.bind(this)
    this.setFieldProps = this.setFieldProps.bind(this)

    this.reset = this.reset.bind(this)
    this.validate = this.validate.bind(this)
    this.subscribeValue = this.subscribeValue.bind(this)
    this.listenStoreValue = this.listenStoreValue.bind(this)
    this.removeListenStoreValue = this.removeListenStoreValue.bind(this)
    this.subscribeError = this.subscribeError.bind(this)
    this.subscribeProps = this.subscribeProps.bind(this)
  }

  // 获取
  public getFieldProps(name?: string) {
    if (name) {
      return this.fieldsProps?.[name]
    } else {
      return this.fieldsProps
    }
  }

  // 设置表单域
  public setFieldProps(name: string, field?: FieldProps) {
    if (!name) return;
    if (field === undefined) {
      delete this.fieldsProps[name]
    } else {
      const lastField = this.fieldsProps[name];
      const newField = { ...lastField, ...field };
      this.fieldsProps[name] = newField;
    }
    this.notifyProps(name);
  }

  // 获取所有表单值，或者单个表单值,或者多个表单值
  public getFieldValue(name?: string | string[]) {
    return name === undefined ? (this.values && { ...this.values }) : deepGet(this.values, name)
  }

  // 获取旧表单值
  public getLastValue(name?: string | string[]) {
    return name === undefined ? (this.lastValues && { ...this.lastValues }) : deepGet(this.lastValues, name)
  }

  // 更新表单值，单个表单值或多个表单值
  public async setFieldValue(name: string | { [key: string]: any }, value?: any, isMount?: boolean) {
    if (typeof name === 'string') {
      // 旧表单值存储
      this.lastValues = deepCopy(this.values);
      // 设置值
      this.values = deepSet(this.values, name, value, formListPath);
      // 同步ui
      this.notifyValue(name);
      // 同时触发另一个值的监听
      this.notifyStoreValue(name, isMount);
      // 规则
      const rules = this.fieldsProps?.[name]?.['rules'];
      if (rules?.length) {
        // 校验规则
        await this.validate(name, isMount);
      }
    } else if (typeof name === 'object') {
      await Promise.all(Object.keys(name).map((n) => this.setFieldValue(n, name?.[n])))
    }
  }

  // 设置表单值(覆盖更新)
  public async setFieldsValue(values: Partial<T>) {
    this.lastValues = deepCopy(this.values);
    this.values = deepCopy(values);
    this.notifyValue();
    this.notifyStoreValue();
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
  public async validate(name: string, isMount?: boolean): Promise<string>
  public async validate(name?: string, isMount?: boolean) {
    if (name === undefined) {
      const result = await Promise.all(Object.keys(this.fieldsProps)?.map((n) => {
        const rules = this.fieldsProps?.[n]?.['rules'];
        if (rules) {
          return this.validate(n)
        }
      }))
      const currentError = result?.filter((message) => message !== undefined)?.[0]
      return {
        error: currentError,
        values: this.getFieldValue()
      }
    } else {
      if (isMount === true) return;
      // 清空错误信息
      this.setFieldError(name, undefined);
      const value = this.getFieldValue(name);
      const rules = this.fieldsProps?.[name]?.['rules'];

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

  // 同步值的变化
  private notifyValue(name?: string) {
    if (name) {
      this.valueListeners.forEach((listener) => {
        if (isExitPrefix(listener?.name, name)) {
          listener?.onChange && listener?.onChange(this.getFieldValue(listener.name), this.getLastValue(listener.name))
        }
      })
    } else {
      this.valueListeners.forEach((listener) => listener.onChange(this.getFieldValue(listener.name), this.getLastValue(listener.name)))
    }
  }

  // 同步值的变化
  private notifyStoreValue(name?: string, isMount?: boolean) {
    if (name) {
      if (!isMount) {
        this.storeValueListeners.forEach((listener) => {
          if (isExitPrefix(listener?.name, name)) {
            listener?.onChange && listener?.onChange(this.getFieldValue(listener.name), this.getLastValue(listener.name))
          }
        })
      }
    } else {
      this.storeValueListeners.forEach((listener) => listener.onChange(this.getFieldValue(listener.name), this.getLastValue(listener.name)))
    }
  }

  // 同步错误的变化
  private notifyError(name?: string) {
    if (name) {
      this.errorListeners.forEach((listener) => {
        if (listener?.name === name) {
          listener?.onChange && listener?.onChange()
        }
      })
    } else {
      this.errorListeners.forEach((listener) => listener.onChange())
    }
  }

  // 同步props的变化
  private notifyProps(name?: string) {
    if (name) {
      this.propsListeners.forEach((listener) => {
        if (listener?.name === name) {
          listener?.onChange && listener?.onChange()
        }
      })
    } else {
      this.propsListeners.forEach((listener) => listener.onChange())
    }
  }

  // 订阅表单值的变动（）
  public subscribeValue(name: string, listener: FormListener['onChange']) {
    this.valueListeners.push({
      onChange: listener,
      name: name
    });
    return () => {
      this.valueListeners = this.valueListeners.filter((sub) => sub.name !== name)
    }
  }

  // 主动订阅表单值的变动(表单控件消失不会卸载)
  public listenStoreValue(name: string, listener: FormListener['onChange']) {
    this.storeValueListeners.push({
      onChange: listener,
      name: name
    });
    return () => {
      this.storeValueListeners = this.storeValueListeners.filter((sub) => sub.name !== name)
    }
  }

  // 卸载
  public removeListenStoreValue(name?: string) {
    if (typeof name === 'string') {
      this.storeValueListeners = this.storeValueListeners.filter((sub) => sub.name !== name)
    } else {
      this.storeValueListeners = []
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

  // 订阅表单的props的变动
  public subscribeProps(name: string, listener: FormListener['onChange']) {
    this.propsListeners.push({
      onChange: listener,
      name: name
    });
    return () => {
      this.propsListeners = this.propsListeners.filter((sub) => sub.name !== name)
    }
  }
}
