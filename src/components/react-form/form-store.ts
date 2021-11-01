
import { deepCopy, deepGetForm, deepSetForm } from './utils'

export type FormListener = { name: string, onChange: () => void }

export type FormValidator = (value: any, values: any) => void | Promise<void>

export type FormRules = { [key: string]: FormValidator }

export type FormErrors = { [key: string]: string | undefined }

export class FormStore<T extends Object = any> {
  private initialValues: T

  private listeners: FormListener[] = []

  private values: T

  private rules: FormRules

  private errors: FormErrors = {}

  public constructor(values: Partial<T> = {}, rules: FormRules = {}) {
    this.initialValues = values as any
    this.values = deepCopy(values) as any
    this.rules = rules

    this.get = this.get.bind(this)
    this.set = this.set.bind(this)
    this.reset = this.reset.bind(this)
    this.error = this.error.bind(this)
    this.validate = this.validate.bind(this)
    this.subscribe = this.subscribe.bind(this)
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

  // 获取所有表单值，或者单个表单值
  public get(name?: string) {
    return name === undefined ? { ...this.values } : deepGetForm(this.values, name)
  }

  // 设置表单值，单个表单值或多个表单值
  public async set(values: Partial<T>): Promise<void>
  public async set(name: string, value: any, validate?: boolean): Promise<void>
  public async set(name: any, value?: any, validate?: boolean) {
    if (typeof name === 'string') {
      this.values = deepSetForm(this.values, name, value);
      this.notify(name)

      if (validate) {
        await this.validate(name).catch((err) => err)
      }
    } else if (name) {
      await Promise.all(Object.keys(name).map((n) => this.set(n, name[n])))
    }
  }

  public reset() {
    this.errors = {}
    this.values = deepCopy(this.initialValues)
    this.notify()
  }

  public error(): FormErrors
  public error(name: number | string): string | undefined
  public error(name: string, value: string | undefined): string | undefined
  public error(...args: any[]) {
    let [name, value] = args

    if (args.length === 0) return this.errors

    if (typeof name === 'number') {
      name = Object.keys(this.errors)[name]
    }

    if (args.length === 2) {
      if (value === undefined) {
        delete this.errors[name]
      } else {
        this.errors[name] = value
      }
    }

    return this.errors[name]
  }


  public async validate(): Promise<T>
  public async validate(name: string): Promise<any>
  public async validate(name?: string) {
    if (name === undefined) {
      let error: Error | undefined = undefined

      try {
        await Promise.all(Object.keys(this.rules).map((n) => this.validate(n)))
      } catch (err) {
        error = err
      }

      if (error) throw error

      return this.get()
    } else {
      const validator = this.rules[name]
      const value = this.get(name)
      let error: Error | undefined = undefined

      if (validator) {
        try {
          await validator(value, this.values)
        } catch (err) {
          error = err
        }
      }

      this.error(name, error && error.message)
      if (error) throw error

      return value
    }
  }

  // 订阅表单变动
  public subscribe(name: string, listener: FormListener['onChange']) {
    this.listeners.push({
      onChange: listener,
      name: name
    })

    return () => {
      this.listeners = this.listeners.filter((sub) => sub.name !== name)
    }
  }
}
