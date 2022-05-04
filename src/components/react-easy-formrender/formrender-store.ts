import { klona } from "klona";
import React from "react";
import { FormStore } from "../react-easy-formcore"
import { FormFieldProps, SchemaData } from "./types";
import { setPropertiesByPath } from "./utils/utils";

export const FormRenderStoreContext = React.createContext<FormRenderStore | undefined>(undefined)

export type FormRenderListener = { path: string, onChange: (newValue?: any, oldValue?: any) => void }

// 管理formrender过程中的数据
export class FormRenderStore<T extends Object = any> extends FormStore {
  public schema: SchemaData | undefined;
  private schemaListeners: FormRenderListener[] = []
  constructor(values: Partial<T> = {}) {
    super(values);
    this.schema = undefined;
  }

  // 设置schema
  setStoreSchema(data: SchemaData) {
    this.schema = data;
  }

  // 更新schema中的值
  setSchemaByPath = (path: string, data?: Partial<FormFieldProps>) => {
    const schema = this.schema;
    const properties = schema?.properties;
    if (properties) {
      const newProperties = setPropertiesByPath(properties, path, data);
      schema.properties = newProperties;
      const newSchema = klona(schema);
      this.setStoreSchema(newSchema);
    }
  }

  // 订阅表单值的变动
  public subscribeValue(path: string, listener: FormRenderListener['onChange']) {
    this.schemaListeners.push({
      onChange: listener,
      path: path
    });
    return () => {
      this.schemaListeners = this.schemaListeners.filter((sub) => sub.path !== path)
    }
  }
}