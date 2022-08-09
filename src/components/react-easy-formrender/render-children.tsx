import React, { useContext, useEffect, useState } from 'react';
import { FormFieldProps, generateChildFunc, getChildrenList, RenderFormChildrenProps, SchemaData, SchemaComponent, FormItemInfo } from './types';
import { defaultComponents } from './components';
import { defaultFields } from './fields';
import { FormOptionsContext, FormStoreContext, getCurrentPath } from '../react-easy-formcore';
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
    renderList,
    renderItem,
    onPropertiesChange,
    inside,
  } = props;

  const mergeFields = { ...defaultFields, ...Fields };
  const mergeComponents = { ...defaultComponents, ...components };

  const {
    onValuesChange
  } = options;

  const valuesCallback = (params: { path?: string, value: any }) => {
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
      store.setProperties(props?.properties)
    }
  }, [props?.properties]);

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

  // 获取field的类型
  const getFieldType = (params: FormItemInfo) => {
    const { field } = params || {};
    // 容器不返回field
    if (field?.category == 'container') {
      return;
    }
    if (field?.readOnly) {
      return 'List.Item';
    }
    if (field?.properties instanceof Array) {
      return 'Form.List';
    }
    return 'Form.Item';
  }

  // 组件生成实例
  const createInstance = (target: Array<SchemaComponent> | SchemaComponent | any, typeMap?: any, extra?: any): any => {
    if (target instanceof Array) {
      return target?.map((item) => {
        return createInstance(item, typeMap);
      });
    } else {
      const Child = componentParse(target, typeMap);
      const { children, ...restProps } = target?.props || {};
      if (typeof Child === 'function' || typeof Child?.render === 'function') {
        return (
          <Child {...extra} {...restProps}>
            {children ? createInstance(children, typeMap) : null}
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
    // 如果是个对象则返回空
    if (typeof target === 'object') {
      return;
    }
    // 其他值
    return target;
  }

  // 生成表单控件
  const generateChild: generateChildFunc = (params) => {
    const { name, field, path } = params || {};
    const { readOnly, readOnlyItem, readOnlyRender, hidden, props, type, typeRender, properties, footer, suffix, ...restField } = field;

    const fieldType = getFieldType(params);
    const FormField = fieldType && mergeFields?.[fieldType];
    const instanceParams = { ...params, store };
    const footerInstance = createInstance(footer, mergeComponents, instanceParams);
    const suffixInstance = createInstance(suffix, mergeComponents, instanceParams);
    if (!field) return;

    const formvalues = store?.getFieldValue();
    const fieldProps = {
      key: name,
      ...restField,
      name: name,
      onValuesChange: valuesCallback,
      footer: footerInstance,
      suffix: suffixInstance
    }
    const fieldChildProps = {
      ...params,
      ...props,
      formvalues,
      store
    };

    // 表单控件
    const formItemChild = createInstance(typeRender, undefined, instanceParams) ?? createInstance({ type, props }, controls, fieldChildProps);
    // 只读显示
    const readOnlyChild = createInstance(readOnlyRender, undefined, instanceParams) ?? createInstance({ type: readOnlyItem }, controls, fieldChildProps);
    const fieldChild = readOnly === true ? readOnlyChild : formItemChild;
    const fieldChilds = renderChildrenList(generateChild, { name, path: path, field: field });
    const child = typeof properties === 'object' ? fieldChilds : fieldChild;
    const result = (
      FormField ?
        <FormField {...fieldProps}>
          {child}
        </FormField>
        : child
    );
    return result;
  };

  // 根据properties渲染子列表
  const renderChildrenList: getChildrenList = (generate, parent) => {
    const { path, field } = parent || {};
    const childProperties = parent ? field?.properties : properties;
    const childInside = parent ? field?.inside : inside;
    const childs = Object.entries(childProperties || {})?.map(([name, formField], index) => {
      name = childProperties instanceof Array ? `[${name}]` : name;
      const currentPath = getCurrentPath(name, path);
      const newField = showCalcFieldProps(formField, currentPath);
      if (newField) {
        newField['index'] = index;
      }
      const childProps = { name: name, field: newField, path: currentPath };
      if (newField?.hidden === true) {
        return;
      }
      const child = generate(childProps);
      const RenderItem = renderItem as any;
      const Outside = componentParse(newField?.outside, mergeComponents);
      const childWithItem = RenderItem ? <RenderItem key={name} data-type="fragment" {...childProps}>{child}</RenderItem> : child;
      const childWithSide = Outside ? <Outside key={name} data-type="fragment" {...childProps} {...newField?.outside?.props}>{childWithItem}</Outside> : childWithItem;
      return childWithSide;
    });

    const Inside = componentParse(childInside, mergeComponents);
    const RenderList = renderList as any;
    const childsWithList = RenderList ? <RenderList key={path} data-type="fragment" {...parent}>{childs}</RenderList> : childs;
    const childsWithSide = Inside ? <Inside key={path} data-type="fragment" {...parent} {...childInside?.props}>{childsWithList}</Inside> : childsWithList;
    return childsWithSide;
  }

  return renderChildrenList(generateChild);
}
