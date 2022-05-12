import { klona } from "klona";
import { FormStore } from "../react-easy-formcore"
import { FormFieldProps, SchemaData } from "./types";
import { getItemByPath, setPropertiesByPath, updatePropertiesByPath } from "./utils/utils";

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
  public getProperties(propertiesName?: string) {
    if (propertiesName) {
      return this.propertiesMap?.[propertiesName]
    } else {
      return this.propertiesMap
    }
  }

  // 设置properties
  setProperties(propertiesName: string, data: SchemaData['properties']) {
    if (!propertiesName) return;
    this.lastPropertiesMap = klona(this.propertiesMap);
    if (data === undefined) {
      delete this.propertiesMap[propertiesName]
    } else {
      this.propertiesMap[propertiesName] = data;
    }
    this.notifyProperties(propertiesName);
  }

  // 更新指定路径的值
  updateItemByPath = (path: string, data?: Partial<FormFieldProps>, propertiesName = "default") => {
    const properties = this.getProperties(propertiesName);
    if (properties) {
      let newProperties = updatePropertiesByPath(properties, path, data);
      this.setProperties(propertiesName, newProperties);
    }
  }

  // 设置指定路径的值
  setItemByPath = (path: string, data?: Partial<FormFieldProps>, propertiesName = "default") => {
    const properties = this.getProperties(propertiesName);
    if (properties) {
      let newProperties = setPropertiesByPath(properties, path, data);
      this.setProperties(propertiesName, newProperties);
    }
  }

  // 根据path删除一条
  delItemByPath = (path: string, propertiesName = "default") => {
    const properties = this.getProperties(propertiesName);
    if (properties) {
      let newProperties = setPropertiesByPath(properties, path, undefined);
      this.setProperties(propertiesName, newProperties);
    }
  }

  // 获取指定路径的项
  getItemByPath = (path: string, propertiesName = "default") => {
    const properties = this.getProperties(propertiesName);
    if (properties) {
      return getItemByPath(properties, path);
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