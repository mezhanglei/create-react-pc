import { deepClone } from "@/utils/object";
import { FormStore } from "../react-easy-formcore";
import { FormFieldProps, SchemaData } from "./types";
import { getItemByPath, setItemByPath, updateItemByPath, swapSameLevel, swapDiffLevel, addItemByIndex, AddItem } from "./utils/utils";

export type FormRenderListener = (newValue?: any, oldValue?: any) => void;
export type Properties = SchemaData['properties'];

// 管理formrender过程中的数据
export class FormRenderStore<T extends Object = any> extends FormStore {
  private properties: Properties;
  private lastProperties: Properties | undefined;
  private propertiesListeners: FormRenderListener[] = [];
  constructor(values?: Partial<T>) {
    super(values);
    this.properties = {};
    this.lastProperties = undefined;
    this.getProperties = this.getProperties.bind(this)
    this.setProperties = this.setProperties.bind(this)
  }

  // 获取当前组件的properties
  public getProperties() {
    return deepClone(this.properties);
  }

  // 设置properties
  setProperties(data?: SchemaData['properties']) {
    this.lastProperties = this.properties;
    this.properties = deepClone(data || {});
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

  // 插入值，默认末尾
  addItemByIndex = (data: AddItem | AddItem[], index?: number, parentPath?: string) => {
    const properties = this.getProperties();
    if (properties) {
      let newProperties = addItemByIndex(properties, data, index, parentPath);
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
  swapItemByPath = (from: { parentPath?: string, index: number }, to: { parentPath?: string, index?: number }) => {
    const properties = this.getProperties();
    if (properties) {
      let newProperties;
      if (from?.parentPath === to?.parentPath) {
        newProperties = swapSameLevel(properties, from, to);
      } else {
        newProperties = swapDiffLevel(properties, from, to);
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
      onChange && onChange(this.properties, this.lastProperties);
    })
  }
}