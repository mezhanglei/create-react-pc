import { deepClone } from "@/utils/object";
import { FormFieldProps, PropertiesData } from "./types";
import { getItemByPath, setItemByPath, updateItemByPath, moveSameLevel, moveDiffLevel, addItemByIndex, updateName, getPathEndIndex, getParent } from "./utils/utils";

export type FormRenderListener = (newValue?: any, oldValue?: any) => void;

// 管理formrender过程中的数据
export class FormRenderStore {
  private properties: PropertiesData;
  private lastProperties: PropertiesData | undefined;
  private propertiesListeners: FormRenderListener[] = [];
  constructor() {
    this.properties = {};
    this.lastProperties = undefined;
    this.getProperties = this.getProperties.bind(this)
    this.setProperties = this.setProperties.bind(this)
  }

  // 获取当前组件的properties
  public getProperties() {
    return deepClone(this.properties || {});
  }

  // 设置properties
  setProperties(data?: PropertiesData) {
    this.lastProperties = this.properties;
    this.properties = data || {};
    setTimeout(() => {
      this.notifyProperties();
    }, 0);
  }

  // 更新指定路径的值
  updateItemByPath = (path?: string, data?: Partial<FormFieldProps>) => {
    const cloneProperties = this.getProperties();
    if (cloneProperties) {
      let newProperties = updateItemByPath(cloneProperties, path, data);
      this.setProperties(newProperties);
    }
  }

  // 设置指定路径的值
  setItemByPath = (path?: string, data?: Partial<FormFieldProps>) => {
    const cloneProperties = this.getProperties();
    if (cloneProperties) {
      let newProperties = setItemByPath(cloneProperties, path, data);
      this.setProperties(newProperties);
    }
  }

  // 更新键
  updateNameByPath = (path?: string, newName?: string) => {
    const cloneProperties = this.getProperties();
    if (cloneProperties) {
      let newProperties = updateName(cloneProperties, path, newName);
      this.setProperties(newProperties);
    }
  }

  // 插入值，默认末尾
  addItemByIndex = (data: FormFieldProps | FormFieldProps[], index?: number, parent?: string) => {
    const cloneProperties = this.getProperties();
    if (cloneProperties) {
      let newProperties = addItemByIndex(cloneProperties, data, index, parent);
      this.setProperties(newProperties);
    }
  }

  // 根据path删除一条
  delItemByPath = (path?: string) => {
    const cloneProperties = this.getProperties();
    if (cloneProperties) {
      let newProperties = setItemByPath(cloneProperties, path, undefined);
      this.setProperties(newProperties);
    }
  }

  // 获取指定路径的项
  getItemByPath = (path?: string) => {
    const cloneProperties = this.getProperties();
    if (cloneProperties) {
      return getItemByPath(cloneProperties, path);
    }
  }

  // 从from到to更换位置
  moveItemByPath = (from: { parent?: string, index: number }, to: { parent?: string, index?: number }) => {
    const cloneProperties = this.getProperties();
    if (cloneProperties) {
      let newProperties;
      if (from?.parent === to?.parent) {
        newProperties = moveSameLevel(cloneProperties, from, to);
      } else {
        newProperties = moveDiffLevel(cloneProperties, from, to);
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
      const cloneProperties = this.getProperties()
      onChange && onChange(cloneProperties, this.lastProperties);
    })
  }

  // 在目标路径后面插入数据
  addAfterByPath = (data: FormFieldProps | FormFieldProps[], path?: string) => {
    const cloneProperties = this.getProperties();
    if (cloneProperties) {
      const nextIndex = getPathEndIndex(path, cloneProperties) + 1;
      const parent = getParent(path);
      let newProperties = addItemByIndex(cloneProperties, data, nextIndex, parent);
      this.setProperties(newProperties);
    }
  }

  // 在目标路径前面插入数据
  addBeforeByPath = (data: FormFieldProps | FormFieldProps[], path?: string) => {
    const cloneProperties = this.getProperties();
    if (cloneProperties) {
      const endIndex = getPathEndIndex(path, cloneProperties);
      const beforeIndex = endIndex > 0 ? endIndex - 1 : 0;
      const parent = getParent(path);
      let newProperties = addItemByIndex(cloneProperties, data, beforeIndex, parent);
      this.setProperties(newProperties);
    }
  }
}
