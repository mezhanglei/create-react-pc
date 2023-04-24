import { deepClone } from "@/utils/object";
import { joinFormPath } from "../react-easy-formcore";
import { FieldUnionType, GeneratePrams, PropertiesData } from "./types";
import createInstance from "./utils/createInstance";
import { getItemByPath, setItemByPath, updateItemByPath, moveSameLevel, moveDiffLevel, insertItemByIndex, updateName, parseFromField, InsertItemType, getKeyValueByIndex } from "./utils/utils";

export type FormRenderListener = (newValue?: any, oldValue?: any) => void;

// 管理formrender过程中的数据
export class FormRenderStore {
  private components: any;
  private properties: PropertiesData;
  private lastProperties: PropertiesData | undefined;
  private propertiesListeners: FormRenderListener[] = [];
  constructor() {
    this.properties = {};
    this.lastProperties = undefined;
    this.getProperties = this.getProperties.bind(this)
    this.setProperties = this.setProperties.bind(this)
    this.registry = this.registry.bind(this)
    this.componentParse = this.componentParse.bind(this)
    this.componentInstance = this.componentInstance.bind(this)
    this.components = {};
  }

  // 注册components
  public registry(key: 'components', data: any) {
    this[key] = data;
  };

  // 解析components
  public componentParse(target?: FieldUnionType) {
    const typeMap = this.components;
    return parseFromField(target, typeMap);
  }

  // 创建components的实例
  public componentInstance(target?: FieldUnionType, commonProps?: GeneratePrams) {
    const typeMap = this.components;
    return createInstance(target, typeMap, commonProps);
  }

  // 获取当前组件的properties
  public getProperties() {
    return deepClone(this.properties || {});
  }

  // 设置properties
  setProperties(data?: PropertiesData) {
    this.lastProperties = this.properties;
    this.properties = data || {};
    this.notifyProperties();
  }

  // 更新指定路径的值
  updateItemByPath = (data?: any, path?: string, attributeName?: string) => {
    const cloneProperties = this.getProperties();
    if (cloneProperties) {
      let newProperties = updateItemByPath(cloneProperties, data, path, attributeName);
      this.setProperties(newProperties);
    }
  }

  // 设置指定路径的值
  setItemByPath = (data?: any, path?: string, attributeName?: string) => {
    const cloneProperties = this.getProperties();
    if (cloneProperties) {
      let newProperties = setItemByPath(cloneProperties, data, path, attributeName);
      this.setProperties(newProperties);
    }
  }

  // 设置指定路径的值
  setItemByIndex = (data?: any, index?: number, parent?: { path?: string, attributeName?: string }) => {
    const cloneProperties = this.getProperties();
    if (cloneProperties) {
      const [key] = getKeyValueByIndex(cloneProperties, index, parent);
      const { path, attributeName } = parent || {};
      const formPath = attributeName ? path : joinFormPath(path, key);
      let newProperties = setItemByPath(cloneProperties, data, formPath, attributeName);
      this.setProperties(newProperties);
    }
  }

  // 更新节点的键
  updateNameByPath = (path?: string, newName?: string) => {
    const cloneProperties = this.getProperties();
    if (cloneProperties) {
      let newProperties = updateName(cloneProperties, path, newName);
      this.setProperties(newProperties);
    }
  }

  // 插入值，默认末尾
  insertItemByIndex = (data: InsertItemType, index?: number, parent?: { path?: string, attributeName?: string }) => {
    const cloneProperties = this.getProperties();
    if (cloneProperties) {
      let newProperties = insertItemByIndex(cloneProperties, data, index, parent);
      this.setProperties(newProperties);
    }
  }

  // 根据path删除一条
  delItemByPath = (path?: string, attributeName?: string) => {
    const cloneProperties = this.getProperties();
    if (cloneProperties) {
      let newProperties = setItemByPath(cloneProperties, undefined, path, attributeName);
      this.setProperties(newProperties);
    }
  }

  // 获取指定路径的项
  getItemByPath = (path?: string, attributeName?: string) => {
    const cloneProperties = this.getProperties();
    if (cloneProperties) {
      return getItemByPath(cloneProperties, path, attributeName);
    }
  }

  // 获取指定index的项
  getItemByIndex = (index: number, parent: { path?: string, attributeName?: string }) => {
    const cloneProperties = this.getProperties();
    if (cloneProperties) {
      const [, value] = getKeyValueByIndex(cloneProperties, index, parent);
      return value;
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
}
