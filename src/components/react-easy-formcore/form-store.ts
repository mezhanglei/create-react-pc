import { isExitPrefix, validateTriggerCondition } from './utils/utils';
import { deepClone, deepGet, deepSet } from '@/utils/object';
import Validator, { FormRule } from './validator';
import { TriggerType } from './item-core';

export type FormListener = { path: string, onChange: (newValue?: any, oldValue?: any) => void }

export type FormErrors<T = any> = { [key in keyof T]?: T[key] }

export type ValidateResult<T> = { error?: string, values: T }

export type FieldProps = { rules?: FormRule[], [other: string]: any };

export type FormFieldsProps<T = any> = { [key in keyof T]: FieldProps };

export class FormStore<T extends Object = any> {
  private initialValues?: Partial<T>

  private formItemListeners: FormListener[] = []

  private formValueListeners: FormListener[] = []

  private formValuesListeners: Array<FormListener['onChange']> = []

  private errorListeners: FormListener[] = []

  private values?: Partial<T>
  private lastValues?: Partial<T>

  private formErrors: FormErrors = {}

  private fieldProps: FormFieldsProps = {};
  private validator: Validator;

  public constructor(values?: Partial<T>) {
    this.initialValues = values
    this.fieldProps = {}
    this.formErrors = {}
    this.validator = new Validator();
    this.values = deepClone(values)
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
    this.subscribeError = this.subscribeError.bind(this)
    this.unsubscribeError = this.unsubscribeError.bind(this)
    this.subscribeFormItem = this.subscribeFormItem.bind(this)
    this.unsubscribeFormItem = this.unsubscribeFormItem.bind(this)
    this.subscribeFormValue = this.subscribeFormValue.bind(this)
    this.unsubscribeFormValue = this.unsubscribeFormValue.bind(this)
    this.subscribeFormValues = this.subscribeFormValues.bind(this)
    this.unsubscribeFormValues = this.unsubscribeFormValues.bind(this)

    this.notifyError = this.notifyError.bind(this)
    this.notifyFormItem = this.notifyFormItem.bind(this)
    this.notifyFormValue = this.notifyFormValue.bind(this)
    this.notifyFormValues = this.notifyFormValues.bind(this)
  }

  // 获取
  public getFieldProps(path?: string) {
    if (path === undefined) {
      return this.fieldProps
    } else {
      return this.fieldProps?.[path]
    }
  }

  // 设置表单域
  public setFieldProps(path: string, field?: FieldProps) {
    if (!path) return;
    if (field === undefined) {
      delete this.fieldProps[path]
    } else {
      const lastField = this.fieldProps[path];
      const newField = Object.assign({}, lastField, field);
      this.fieldProps[path] = newField;
      this.validator.add(path, field?.['rules']);
    };
  }

  // 获取所有表单值，或者单个表单值,或者多个表单值
  public getFieldValue(path?: string | string[]) {
    return path === undefined ? this.values : deepGet(this.values, path)
  }

  // 获取旧表单值
  public getLastValue(path?: string | string[]) {
    return path === undefined ? this.lastValues : deepGet(this.lastValues, path)
  }

  // 设置初始值
  public setInitialValues(path: string, initialValue: any) {
    this.initialValues = deepSet(this.initialValues, path, initialValue);
    // 旧表单值存储
    this.lastValues = deepClone(this.values);
    // 设置值
    this.values = deepSet(this.values, path, initialValue);
    this.notifyFormItem(path);
    this.notifyFormValue(path);
    this.notifyFormValues();
  }

  // 获取初始值
  public getInitialValues(path?: string | string[]) {
    return path === undefined ? this.initialValues : deepGet(this.initialValues, path)
  }

  // 更新表单值，单个表单值或多个表单值
  public setFieldValue(path: string | Partial<T>, value?: any, eventName?: TriggerType | boolean) {
    // 设置单个表单值
    const setFormItemValue = (path: string, value?: any, eventName?: TriggerType | boolean) => {
      // 旧表单值存储
      this.lastValues = deepClone(this.values);
      // 设置值
      this.values = deepSet(this.values, path, value);
      // 规则
      const fieldProps = this.getFieldProps(path);
      const rules = fieldProps?.['rules'];
      if (rules?.length && rules instanceof Array) {
        // 校验规则
        this.validate(path, eventName);
      }
    };

    if (typeof path === 'string') {
      setFormItemValue(path, value, eventName);
      this.notifyFormItem(path);
      this.notifyFormValue(path);
      this.notifyFormValues();
    } else if (typeof path === 'object') {
      Promise.all(Object.keys(path).map((n) => setFormItemValue(n, path?.[n])))
      this.notifyFormItem();
      this.notifyFormValue();
      this.notifyFormValues();
    }
  }

  // 设置表单值(覆盖更新)
  public setFieldsValue(values?: Partial<T>) {
    this.lastValues = deepClone(this.values);
    this.values = values;
    this.notifyFormItem();
    this.notifyFormValue();
    this.notifyFormValues();
  }

  // 重置表单
  public reset(endValues?: Partial<T>) {
    const end = endValues || this.initialValues;
    this.setFieldsError({});
    this.setFieldsValue(end);
  }

  // 获取error信息
  public getFieldError(path?: string) {
    if (path === undefined) {
      return this.formErrors
    } else {
      return this.formErrors[path]
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
  private setFieldsError(erros: FormErrors<T>) {
    this.formErrors = deepClone(erros);
    this.notifyError();
  }

  // 校验整个表单或校验表单中的某个控件
  public async validate(): Promise<ValidateResult<T>>
  public async validate(path: string, eventName?: TriggerType | boolean): Promise<string>
  public async validate(path?: string | string[], eventName?: TriggerType | boolean) {
    const singleValidate = async (path: string) => {
      // 清空错误信息
      this.setFieldError(path, undefined);
      const fieldProps = this.getFieldProps(path) || {};
      const value = this.getFieldValue(path);
      const ignore = fieldProps?.ignore;
      const canTrigger = validateTriggerCondition(eventName, fieldProps?.['validateTrigger']);
      if (canTrigger && ignore !== true) {
        const error = await this.validator.start(path, value, eventName);
        if (error) {
          this.setFieldError(path, error);
        }
        return error;
      }
    };

    if (path instanceof Array || path === undefined) {
      const fieldPropsMap = this.getFieldProps() || {};
      const keys = path instanceof Array ? path : Object.keys(fieldPropsMap || {});
      const result = await Promise.all(keys?.map((key) => {
        const fieldProps = fieldPropsMap?.[key];
        const rules = fieldProps?.['rules'];
        if (rules instanceof Array) {
          return singleValidate(key)
        }
      }));
      const currentError = result?.filter((error) => error !== undefined)?.[0]
      return {
        error: currentError,
        values: this.getFieldValue()
      }
    } else if (typeof path === 'string') {
      return singleValidate(path);
    }
  }

  // 同步当前表单域值的变化
  private notifyFormItem(path?: string) {
    if (path) {
      this.formItemListeners.forEach((listener) => {
        if (listener?.path === path) {
          listener?.onChange && listener?.onChange(this.getFieldValue(listener.path), this.getLastValue(listener.path))
        }
      })
    } else {
      this.formItemListeners.forEach((listener) => listener.onChange(this.getFieldValue(listener.path), this.getLastValue(listener.path)))
    }
  }

  // 同步路径上任意节点的变化
  private notifyFormValue(path?: string) {
    if (path) {
      this.formValueListeners.forEach((listener) => {
        if (isExitPrefix(listener?.path, path)) {
          listener?.onChange && listener?.onChange(this.getFieldValue(listener.path), this.getLastValue(listener.path))
        }
      })
    } else {
      this.formValueListeners.forEach((listener) => listener.onChange(this.getFieldValue(listener.path), this.getLastValue(listener.path)))
    }
  }

  // 同步
  private notifyFormValues() {
    this.formValuesListeners.forEach((onChange) => onChange(this.getFieldValue(), this.getLastValue()))
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

  // 订阅当前表单域值的变动(当表单域消失时会卸载)
  public subscribeFormItem(path: string, listener: FormListener['onChange']) {
    this.formItemListeners.push({
      onChange: listener,
      path: path
    });
    return () => {
      this.formItemListeners = this.formItemListeners.filter((sub) => sub.path !== path)
    }
  }

  // 主动订阅路径上所有表单控件的变动(表单控件消失不会卸载)
  public subscribeFormValue(path: string, listener: FormListener['onChange']) {
    this.formValueListeners.push({
      onChange: listener,
      path: path
    });
    return () => {
      this.formValueListeners = this.formValueListeners.filter((sub) => sub.path !== path)
    }
  }

  // 订阅整个表单值(表单控件消失不会卸载)
  public subscribeFormValues(listener: FormListener['onChange']) {
    this.formValuesListeners.push(listener);
    return () => {
      this.formValuesListeners = []
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

  // 卸载
  public unsubscribeFormItem(path?: string) {
    if (path === undefined) {
      this.formItemListeners = []
    } else if (typeof path === 'string') {
      this.formItemListeners = this.formItemListeners.filter((sub) => sub.path !== path)
    }
  }

  // 卸载
  public unsubscribeFormValue(path?: string) {
    if (path === undefined) {
      this.formValueListeners = []
    } else if (typeof path === 'string') {
      this.formValueListeners = this.formValueListeners.filter((sub) => sub.path !== path)
    }
  }

  // 卸载
  public unsubscribeFormValues() {
    this.formValuesListeners = [];
  }

  // 卸载
  public unsubscribeError(path?: string) {
    if (path === undefined) {
      this.errorListeners = []
    } else if (typeof path === 'string') {
      this.errorListeners = this.errorListeners.filter((sub) => sub.path !== path)
    }
  }
}
