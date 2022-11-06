import { deepClone } from "@/utils/object";
import { FormStore } from "../react-easy-formcore";
import { FormFieldProps, PropertiesData } from "./types";
import { getItemByPath, setItemByPath, updateItemByPath, moveSameLevel, moveDiffLevel, addItemByIndex, updateName, getPathEndIndex, getParent, mergeProperties } from "./utils/utils";

export type FormRenderListener = (newValue?: any, oldValue?: any) => void;

// 管理formrender过程中的数据
export class FormRenderStore<T extends Object = any> extends FormStore {
  private properties: PropertiesData;
  private lastProperties: PropertiesData | undefined;
  private propertiesListeners: FormRenderListener[] = [];
  constructor(values?: Partial<T>) {
    super(values);
    this.properties = {};
    this.lastProperties = undefined;
    this.getProperties = this.getProperties.bind(this)
    this.setProperties = this.setProperties.bind(this)
    this.updateProperties = this.updateProperties.bind(this)
  }

  // 获取当前组件的properties
  public getProperties() {
    return this.properties;
  }

  // 设置properties
  setProperties(data?: PropertiesData) {
    this.lastProperties = this.properties;
    this.properties = deepClone(data || {});
    this.notifyProperties();
  }

  // 更新properties
  updateProperties(data?: PropertiesData) {
    this.lastProperties = this.properties;
    this.properties = mergeProperties(this.properties, data)
    this.notifyProperties();
  }

  // 更新指定路径的值
  updateItemByPath = (path: string, data?: Partial<FormFieldProps>) => {
    const properties = this.getProperties();
    if (properties) {
      let newProperties = updateItemByPath(properties, path, data);
      this.setProperties(newProperties);
    }
  }

  // 设置指定路径的值
  setItemByPath = (path: string, data?: Partial<FormFieldProps>) => {
    const properties = this.getProperties();
    if (properties) {
      let newProperties = setItemByPath(properties, path, data);
      this.setProperties(newProperties);
    }
  }

  // 更新键
  updateNameByPath = (path: string, newName?: string) => {
    const properties = this.getProperties();
    if (properties) {
      let newProperties = updateName(properties, path, newName);
      this.setProperties(newProperties);
    }
  }

  // 插入值，默认末尾
  addItemByIndex = (data: FormFieldProps | FormFieldProps[], index?: number, parent?: string) => {
    const properties = this.getProperties();
    if (properties) {
      let newProperties = addItemByIndex(properties, data, index, parent);
      this.setProperties(newProperties);
    }
  }

  // 根据path删除一条
  delItemByPath = (path: string) => {
    const properties = this.getProperties();
    if (properties) {
      let newProperties = setItemByPath(properties, path, undefined);
      this.setProperties(newProperties);
    }
  }

  // 获取指定路径的项
  getItemByPath = (path: string) => {
    const properties = this.getProperties();
    if (properties) {
      return getItemByPath(properties, path);
    }
  }

  // 从from到to更换位置
  moveItemByPath = (from: { parent?: string, index: number }, to: { parent?: string, index?: number }) => {
    const properties = this.getProperties();
    if (properties) {
      let newProperties;
      if (from?.parent === to?.parent) {
        newProperties = moveSameLevel(properties, from, to);
      } else {
        newProperties = moveDiffLevel(properties, from, to);
      }
      this.setProperties(newProperties);
    }
  }

  // 订阅表单渲染数据的变动
  public subscribeProperties(listener: FormRenderListener) {
    this.propertiesListeners.push(listener);
    return () => {
      this.propertiesListeners = [];
    }
  }

  // 同步表单渲染数据的变化
  private notifyProperties() {
    this.propertiesListeners.forEach((onChange) => {
      const properties = this.getProperties()
      onChange && onChange(properties, this.lastProperties);
    })
  }

  // 在目标路径后面插入数据
  addAfterByPath = (data: FormFieldProps | FormFieldProps[], path: string) => {
    const properties = this.getProperties();
    if (properties) {
      const nextIndex = getPathEndIndex(path, properties) + 1;
      const parent = getParent(path);
      let newProperties = addItemByIndex(properties, data, nextIndex, parent);
      this.setProperties(newProperties);
    }
  }

  // 在目标路径前面插入数据
  addBeforeByPath = (data: FormFieldProps | FormFieldProps[], path: string) => {
    const properties = this.getProperties();
    if (properties) {
      const endIndex = getPathEndIndex(path, properties);
      const beforeIndex = endIndex > 0 ? endIndex - 1 : 0;
      const parent = getParent(path);
      let newProperties = addItemByIndex(properties, data, beforeIndex, parent);
      this.setProperties(newProperties);
    }
  }
}
