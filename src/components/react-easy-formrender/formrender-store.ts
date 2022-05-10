import { klona } from "klona";
import { FormStore } from "../react-easy-formcore"
import { FormFieldProps, SchemaData } from "./types";
import { setPropertiesByPath, updatePropertiesByPath } from "./utils/utils";

export type FormRenderListener = { name: string, onChange: (newValue?: any, oldValue?: any) => void }
export type PropertiesMap = { [key: string]: SchemaData['properties'] }

// 管理formrender过程中的数据
export class FormRenderStore<T extends Object = any> extends FormStore {
  private propertiesMap: PropertiesMap | {};
  private lastPropertiesMap: PropertiesMap | {};
  private propertiesListeners: FormRenderListener[] = [];
  constructor(values: Partial<T> = {}) {
    super(values);
    this.propertiesMap = {};
    this.lastPropertiesMap = {};
    this.getProperties = this.getProperties.bind(this)
    this.setProperties = this.setProperties.bind(this)
  }

  // 获取当前组件的properties
  public getProperties(name?: string) {
    if (name) {
      return this.propertiesMap?.[name]
    } else {
      return this.propertiesMap
    }
  }

  // 设置properties
  setProperties(name: string, data: SchemaData['properties']) {
    if (!name) return;
    this.lastPropertiesMap = klona(this.propertiesMap);
    if (data === undefined) {
      delete this.propertiesMap[name]
    } else {
      this.propertiesMap[name] = data;
    }
    this.notifyProperties(name);
  }

  // 更新properties中指定路径的值
  updatePropertiesByPath = (path: string, data?: Partial<FormFieldProps>, childrenName = "default") => {
    const properties = this.getProperties(childrenName);
    if (properties) {
      let newProperties = updatePropertiesByPath(properties, path, data);
      newProperties = klona(newProperties);
      this.setProperties(childrenName, newProperties);
    }
  }

  // 覆盖设置properties中指定路径的值
  setPropertiesByPath = (path: string, data?: Partial<FormFieldProps>, childrenName = "default") => {
    const properties = this.getProperties(childrenName);
    if (properties) {
      let newProperties = setPropertiesByPath(properties, path, data);
      newProperties = klona(newProperties);
      this.setProperties(childrenName, newProperties);
    }
  }

  // 订阅表单渲染数据的变动
  public subscribeProperties(name: string, listener: FormRenderListener['onChange']) {
    this.propertiesListeners.push({
      onChange: listener,
      name: name
    });
    return () => {
      this.propertiesListeners = this.propertiesListeners.filter((sub) => sub.name !== name)
    }
  }

  // 同步表单渲染数据的变化
  private notifyProperties(name?: string) {
    if (name) {
      this.propertiesListeners.forEach((listener) => {
        if (listener?.name === name) {
          listener?.onChange && listener?.onChange(this.propertiesMap[listener.name], this.lastPropertiesMap[listener.name])
        }
      })
    } else {
      this.propertiesListeners.forEach((listener) => listener.onChange(this.propertiesMap[listener.name], this.lastPropertiesMap[listener.name]))
    }
  }
}