
import { asyncSequentialExe } from '@/utils/common';
import { isExitPrefix } from './utils/utils';
import { klona } from 'klona';
import { deepGet, deepSet } from '@/utils/object';
import { validatorsMap } from './rules-validator';

export type FormListener = { path: string, onChange: (newValue?: any, oldValue?: any) => void }

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

  private initialFieldProps: FormFieldsProps = {};

  public constructor(values: Partial<T> = {}) {
    this.initialValues = values
    this.values = klona(values)
    this.getFieldValue = this.getFieldValue.bind(this)
    this.setFieldValue = this.setFieldValue.bind(this)
    this.setFieldsValue = this.setFieldsValue.bind(this)
    this.getFieldError = this.getFieldError.bind(this)
    this.setFieldError = this.setFieldError.bind(this)
    this.setFieldsError = this.setFieldsError.bind(this)

    this.getInitialFieldProps = this.getInitialFieldProps.bind(this)
    this.setInitialFieldProps = this.setInitialFieldProps.bind(this)

    this.reset = this.reset.bind(this)
    this.validate = this.validate.bind(this)
    this.subscribeFormItem = this.subscribeFormItem.bind(this)
    this.listenFormGlobal = this.listenFormGlobal.bind(this)
    this.removeListenFormGlobal = this.removeListenFormGlobal.bind(this)
    this.subscribeError = this.subscribeError.bind(this)
    this.subscribeProps = this.subscribeProps.bind(this)
  }

  // 获取
  public getInitialFieldProps(path?: string) {
    if (path) {
      return this.initialFieldProps?.[path]
    } else {
      return this.initialFieldProps
    }
  }

  // 设置表单域
  public setInitialFieldProps(path: string, field?: FieldProps) {
    if (!path) return;
    if (field === undefined) {
      delete this.initialFieldProps[path]
    } else {
      const lastField = this.initialFieldProps[path];
      const newField = { ...lastField, ...field };
      this.initialFieldProps[path] = newField;
    }
    this.notifyProps(path);
  }

  // 获取所有表单值，或者单个表单值,或者多个表单值
  public getFieldValue(path?: string | string[]) {
    return path === undefined ? (this.values && { ...this.values }) : deepGet(this.values, path)
  }

  // 获取旧表单值
  public getLastValue(path?: string | string[]) {
    return path === undefined ? (this.lastValues && { ...this.lastValues }) : deepGet(this.lastValues, path)
  }

  // 设置初始值
  public setInitialValues(path: string, initialValue: any) {
    this.initialValues = deepSet(this.initialValues, path, initialValue);
    // 旧表单值存储
    this.lastValues = klona(this.values);
    // 设置值
    this.values = deepSet(this.values, path, initialValue);
    // 异步更新, 只有组件渲染成功了，才会去同步ui操作
    setTimeout(() => {
      const fieldProps = this.getInitialFieldProps(path);
      if (fieldProps) {
        // 同步ui
        this.notifyFormItem(path);
        // 同时触发另一个值的监听
        this.notifyFormGlobal(path);
      }
    }, 0);
  }

  // 获取初始值
  public getInitialValues(path?: string | string[]) {
    return path === undefined ? (this.initialValues && { ...this.initialValues }) : deepGet(this.initialValues, path)
  }

  // 更新表单值，单个表单值或多个表单值
  public async setFieldValue(path: string | Partial<T>, value?: any) {
    if (typeof path === 'string') {
      // 旧表单值存储
      this.lastValues = klona(this.values);
      // 设置值
      this.values = deepSet(this.values, path, value);
      // 同步ui
      this.notifyFormItem(path);
      // 同时触发另一个值的监听
      this.notifyFormGlobal(path);
      // 规则
      const rules = this.initialFieldProps?.[path]?.['rules'];
      if (rules?.length) {
        // 校验规则
        await this.validate(path);
      }
    } else if (typeof path === 'object') {
      await Promise.all(Object.keys(path).map((n) => this.setFieldValue(n, path?.[n])))
    }
  }

  // 设置表单值(覆盖更新)
  public async setFieldsValue(values: Partial<T>) {
    this.lastValues = klona(this.values);
    this.values = values;
    this.notifyFormItem();
    this.notifyFormGlobal();
  }

  // 重置表单
  public reset() {
    this.setFieldsError({});
    this.setFieldsValue(this.initialValues);
  }

  // 获取error信息
  public getFieldError(path?: string) {
    if (path) {
      return this.formErrors[path]
    } else {
      return this.formErrors
    }
  }

  // 更新error信息
  private setFieldError(path: string, value: any) {
    if (!path) return;
    if (value === undefined) {
      delete this.formErrors[path]
    } else {
      this.formErrors[path] = value
    }
    this.notifyError(path)
  }

  // 设置error信息(覆盖更新)
  private async setFieldsError(erros: FormErrors<T>) {
    this.formErrors = klona(erros);
    this.notifyError();
  }

  // 校验整个表单或校验表单中的某个控件
  public async validate(): Promise<ValidateResult<T>>
  public async validate(path: string): Promise<string>
  public async validate(path?: string) {
    if (path === undefined) {
      const result = await Promise.all(Object.keys(this.initialFieldProps)?.map((n) => {
        const rules = this.initialFieldProps?.[n]?.['rules'];
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
      // 清空错误信息
      this.setFieldError(path, undefined);
      const value = this.getFieldValue(path);
      const rules = this.initialFieldProps?.[path]?.['rules'];

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
        this.setFieldError(path, currentError);
      }
      return currentError;
    }
  }

  // 同步当前表单域值的变化
  private notifyFormItem(path?: string) {
    if (path) {
      this.valueListeners.forEach((listener) => {
        if (listener?.path === path) {
          listener?.onChange && listener?.onChange(this.getFieldValue(listener.path), this.getLastValue(listener.path))
        }
      })
    } else {
      this.valueListeners.forEach((listener) => listener.onChange(this.getFieldValue(listener.path), this.getLastValue(listener.path)))
    }
  }

  // 同步整个表单值的变化
  private notifyFormGlobal(path?: string) {
    if (path) {
      this.storeValueListeners.forEach((listener) => {
        if (isExitPrefix(listener?.path, path)) {
          listener?.onChange && listener?.onChange(this.getFieldValue(listener.path), this.getLastValue(listener.path))
        }
      })
    } else {
      this.storeValueListeners.forEach((listener) => listener.onChange(this.getFieldValue(listener.path), this.getLastValue(listener.path)))
    }
  }

  // 同步错误的变化
  private notifyError(path?: string) {
    if (path) {
      this.errorListeners.forEach((listener) => {
        if (listener?.path === path) {
          listener?.onChange && listener?.onChange()
        }
      })
    } else {
      this.errorListeners.forEach((listener) => listener.onChange())
    }
  }

  // 同步props的变化
  private notifyProps(path?: string) {
    if (path) {
      this.propsListeners.forEach((listener) => {
        if (listener?.path === path) {
          listener?.onChange && listener?.onChange()
        }
      })
    } else {
      this.propsListeners.forEach((listener) => listener.onChange())
    }
  }

  // 订阅当前表单域值的变动
  public subscribeFormItem(path: string, listener: FormListener['onChange']) {
    this.valueListeners.push({
      onChange: listener,
      path: path
    });
    return () => {
      this.valueListeners = this.valueListeners.filter((sub) => sub.path !== path)
    }
  }

  // 主动订阅整个表单值的变动(表单控件消失不会卸载)
  public listenFormGlobal(path: string, listener: FormListener['onChange']) {
    this.storeValueListeners.push({
      onChange: listener,
      path: path
    });
    return () => {
      this.storeValueListeners = this.storeValueListeners.filter((sub) => sub.path !== path)
    }
  }

  // 卸载
  public removeListenFormGlobal(path?: string) {
    if (typeof path === 'string') {
      this.storeValueListeners = this.storeValueListeners.filter((sub) => sub.path !== path)
    } else {
      this.storeValueListeners = []
    }
  }

  // 订阅表单错误的变动
  public subscribeError(path: string, listener: FormListener['onChange']) {
    this.errorListeners.push({
      onChange: listener,
      path: path
    });
    return () => {
      this.errorListeners = this.errorListeners.filter((sub) => sub.path !== path)
    }
  }

  // 订阅表单的props的变动
  public subscribeProps(path: string, listener: FormListener['onChange']) {
    this.propsListeners.push({
      onChange: listener,
      path: path
    });
    return () => {
      this.propsListeners = this.propsListeners.filter((sub) => sub.path !== path)
    }
  }
}
