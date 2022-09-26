import React, { useContext, useEffect, useState } from 'react';
import { FormFieldProps, RenderFormChildrenProps, SchemaData, SchemaComponent, OverwriteFormFieldProps } from './types';
import { defaultComponents } from './components';
import { defaultFields } from './fields';
import { FormOptionsContext, FormStoreContext, getCurrentPath, ItemCoreProps } from '../react-easy-formcore';
import { FormRenderStore } from './formrender-store';
import { isEqual } from '@/utils/object';
import './iconfont/iconfont.css';

// 是否为class组件
export const isElementClass = (target: any) => {
  return target.prototype instanceof React.Component;
}

// 不带Form容器的组件
export default function RenderFormChildren(props: RenderFormChildrenProps) {

  const store = useContext<FormRenderStore | undefined>(FormStoreContext);
  const options = useContext(FormOptionsContext);

  const [fieldPropsMap, setFieldPropsMap] = useState<Partial<FormFieldProps>>({});
  const [properties, setProperties] = useState<SchemaData['properties']>({});

  const {
    Fields,
    controls,
    components,
    watch,
    onPropertiesChange,
    renderItem,
    renderList,
    inside,
  } = props;

  const propertiesProps = props?.properties;
  const mergeFields = { ...defaultFields, ...Fields };
  const mergeComponents = { ...defaultComponents, ...components };

  const {
    onValuesChange
  } = options;

  const valuesCallback = (params: ItemCoreProps['onValuesChange']) => {
    onValuesChange && onValuesChange(params)
    handleFieldProps();
  }

  // 订阅更新properties的函数,j将传值更新到state里面
  useEffect(() => {
    if (!store) return
    // 订阅目标控件
    const uninstall = store.subscribeProperties((newValue, oldValue) => {
      setProperties(newValue);
      if (!isEqual(newValue, oldValue)) {
        onPropertiesChange && onPropertiesChange(newValue, oldValue)
      }
    })
    return () => {
      uninstall()
    }
  }, [onPropertiesChange]);

  // 收集properties到store中
  useEffect(() => {
    if (store) {
      store.setProperties(propertiesProps)
    }
  }, [propertiesProps]);

  // 变化时更新
  useEffect(() => {
    if (!properties) return;
    handleFieldProps();
    initWatch();
    return () => {
      store?.unsubscribeFormGlobal();
    }
  }, [properties]);

  // 初始化监听
  const initWatch = () => {
    Object.entries(watch || {})?.map(([key, watcher]) => {
      // 函数形式
      if (typeof watcher === 'function') {
        store?.subscribeFormGlobal(key, watcher)
        // 对象形式
      } else if (typeof watcher === 'object') {
        if (typeof watcher.handler === 'function') {
          store?.subscribeFormGlobal(key, watcher.handler);
        }
        if (watcher.immediate) {
          watcher.handler(store?.getFieldValue(key), store?.getLastValue(key));
        }
      }
    });
  }

  // 递归遍历表单域的属性
  const handleFieldProps = () => {
    const fieldPropsMap = {};
    // 遍历处理对象树中的非properties字段
    const deepHandle = (formField: FormFieldProps, parent: string) => {
      for (const propsKey in formField) {
        const value = formField[propsKey];
        if (propsKey !== 'properties') {
          const path = getCurrentPath(propsKey, parent) as string;
          const result = calcExpression(value);
          fieldPropsMap[path] = result;
        } else {
          for (const childKey in value) {
            const name = value instanceof Array ? `[${childKey}]` : childKey;
            const path = getCurrentPath(name, parent) as string;
            const childField = value[childKey];
            deepHandle(childField, path);
          }
        }
      }
    };

    for (const key in properties) {
      const formField = properties[key];
      const name = properties instanceof Array ? `[${key}]` : key;
      deepHandle(formField, name);
    }
    setFieldPropsMap(fieldPropsMap);
  }

  // 展示计算完表达式之后的结果
  const showCalcFieldProps = (field: FormFieldProps, path?: string) => {
    return Object.fromEntries(
      Object.entries(field || {})?.map(
        ([propsKey]) => {
          const currentPath = getCurrentPath(propsKey, path) as string;
          return [propsKey, fieldPropsMap[currentPath] ?? field[propsKey]];
        }
      )
    );
  }

  // 值兼容字符串表达式
  const calcExpression = (value?: string | boolean) => {
    if (typeof value === 'string') {
      const reg = new RegExp('\{\{\s*.*?\s*\}\}', 'gi');
      const hiddenStr = value?.match(reg)?.[0];
      if (hiddenStr) {
        let target = hiddenStr?.replace(/\{\{|\}\}|\s*/g, '');
        target = target?.replace(/\$formvalues/g, 'store && store.getFieldValue()');
        target = target?.replace(/\$store/g, 'store');
        const actionStr = "return " + target;
        // 函数最后一个参数为函数体，前面均为传入的变量名
        const action = new Function('store', actionStr);
        const value = action(store);
        return value;
      } else {
        return value;
      }
    } else {
      return value;
    }
  }

  // 获取field容器
  const getField = (field: OverwriteFormFieldProps) => {
    let fieldType
    if (field?.properties instanceof Array) {
      fieldType = 'Form.List';
    }
    fieldType = 'Form.Item';
    return fieldType && mergeFields?.[fieldType]
  }

  // 组件生成实例
  const createInstance = (target: Array<SchemaComponent> | SchemaComponent | any, typeMap?: any, extra?: any, finalChildren?: any): any => {
    if (target instanceof Array) {
      return target?.map((item) => {
        return createInstance(item, typeMap, extra, finalChildren);
      });
    } else {
      const Child = componentParse(target, typeMap);
      const { children, ...restProps } = target?.props || {};
      if (typeof Child === 'function' || typeof Child?.render === 'function' || typeof Child?.type?.render === 'function') {
        return (
          <Child {...extra} {...restProps}>
            {children ? createInstance(children, typeMap, extra, finalChildren) : finalChildren}
          </Child>
        );
      } else {
        return Child;
      }
    }
  }

  // 从参数中获取组件
  const componentParse = <T,>(target: SchemaComponent | any, typeMap: T) => {
    const hidden = calcExpression(target?.hidden);
    if (hidden === true) {
      return;
    }
    // 注册组件
    const register = typeMap && target?.type && typeMap[target?.type];
    if (register) {
      return register
    }
    // 不符合要求返回空
    if (typeof target === 'object') {
      return;
    }
    // 其他值
    return target;
  }

  // 给目标内部添加inside
  const withInside = (children: any, inside?: SchemaComponent, commonProps?: any) => {
    const RenderList = renderList as any;
    const childsWithList = RenderList ? <RenderList data-type="fragment" {...commonProps}>{children}</RenderList> : children;
    const childsWithSide = inside ? createInstance(inside, mergeComponents, commonProps, childsWithList) : childsWithList;
    return childsWithSide;
  }

  // 给目标外面添加outside
  const withOutside = (children: any, outside?: SchemaComponent, commonProps?: any) => {
    const RenderItem = renderItem as any;
    const childWithItem = RenderItem ? <RenderItem data-type="fragment" {...commonProps}>{children}</RenderItem> : children;
    const childWithSide = outside ? createInstance(outside, mergeComponents, commonProps, childWithItem) : childWithItem;
    return childWithSide;
  }

  // 生成子元素
  const generateChild = (name: string, field: OverwriteFormFieldProps, parent?: string) => {
    if (field?.hidden === true) {
      return;
    }
    const { readOnly, readOnlyItem, readOnlyRender, hidden, props, type, typeRender, properties, footer, suffix, fieldComponent, inside, outside, ...restField } = field;
    const FormField = getField(field);
    if (!field) return;

    const commonParams = { name, field, parent: parent, store }; // 公共参数
    const footerInstance = createInstance(footer, mergeComponents, commonParams);
    const suffixInstance = createInstance(suffix, mergeComponents, commonParams);
    const fieldComponentParse = componentParse(fieldComponent, mergeComponents);
    // 表单域的传参
    const fieldProps = {
      key: name,
      name: name,
      parent: parent,
      onValuesChange: valuesCallback,
      footer: footerInstance,
      suffix: suffixInstance,
      component: fieldComponentParse,
      ...restField
    }
    // 表单域子元素的传参
    const fieldChildProps = {
      ...commonParams,
      ...props,
      formvalues: store?.getFieldValue()
    };
    // 表单域子元素
    const formItemChild = createInstance(typeRender, undefined, commonParams) ?? createInstance({ type, props }, controls, fieldChildProps);
    // 只读显示
    const readOnlyChild = createInstance(readOnlyRender, undefined, commonParams) ?? createInstance({ type: readOnlyItem }, controls, fieldChildProps);
    // 表单控件
    const fieldChild = readOnly === true ? readOnlyChild : formItemChild;
    // 容器传参
    const containerProps = { key: name, ...commonParams };
    // children
    let fieldChildren;
    if (typeof properties === 'object') {
      const currentPath = getCurrentPath(name, parent);
      const childs = Object.entries(properties)?.map(([key, formField], index) => {
        const childName = properties instanceof Array ? `[${key}]` : key;
        const childCurrentPath = getCurrentPath(childName, currentPath);
        const childField = showCalcFieldProps(formField, childCurrentPath);
        if (childField) {
          childField['index'] = index;
        }
        return generateChild(childName, childField, currentPath);
      });
      fieldChildren = withInside(childs, inside, containerProps)
    } else {
      fieldChildren = fieldChild
    }

    const result = (
      FormField ?
        <FormField {...fieldProps}>
          {fieldChildren}
        </FormField>
        : fieldChildren
    );
    return withOutside(result, outside, containerProps)
  }

  // 渲染children
  const renderChildrenList = () => {
    const childs = Object.entries(properties || {})?.map(([name, formField], index: number) => {
      name = properties instanceof Array ? `[${name}]` : name;
      const newField = showCalcFieldProps(formField, name);
      if (newField) {
        newField['index'] = index;
      }
      return generateChild(name, newField);
    })
    return withInside(childs, inside, { store })
  }

  return renderChildrenList();
}

RenderFormChildren.displayName = 'Form.Children';
