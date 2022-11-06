import React, { useContext, useEffect, useState } from 'react';
import { FormFieldProps, RenderFormChildrenProps, GeneratePrams, FieldUnionType, FormComponent, PropertiesData } from './types';
import { defaultComponents } from './components';
import { Form, formatName, FormOptionsContext, FormStoreContext, getCurrentPath, ItemCoreProps } from '../react-easy-formcore';
import { FormRenderStore } from './formrender-store';
import { isEqual } from '@/utils/object';
import './iconfont/iconfont.css';
import { isReactComponent, isValidElement } from '@/utils/ReactIs';

// 不带Form容器的组件
export default function RenderFormChildren(props: RenderFormChildrenProps) {

  const store = useContext<FormRenderStore | undefined>(FormStoreContext);
  const options = useContext(FormOptionsContext);

  const [fieldPropsMap, setFieldPropsMap] = useState<Partial<FormFieldProps>>({});
  const [properties, setProperties] = useState<PropertiesData>({});

  const {
    controls,
    components,
    watch,
    onPropertiesChange,
    renderItem,
    renderList,
    inside,
    properties: propertiesProps
  } = props;

  const mergeComponents = { ...defaultComponents, ...components };

  const {
    onValuesChange
  } = options;

  const valuesCallback: ItemCoreProps['onValuesChange'] = (...args) => {
    onValuesChange && onValuesChange(...args)
    handleFieldProps();
  }

  // 订阅更新properties的函数,将传值更新到state里面
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
      store.updateProperties(propertiesProps)
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
    const deepHandle = (formField: FormFieldProps, path: string) => {
      for (const propsKey in formField) {
        if (propsKey !== 'properties') {
          const propsValue = formField[propsKey];
          const propsPath = getCurrentPath(propsKey, path) as string;
          const result = calcExpression(propsValue);
          fieldPropsMap[propsPath] = result;
        } else {
          const children = formField[propsKey];
          for (const childKey in children) {
            const childField = children[childKey];
            const childName = formatName(childKey, children instanceof Array);
            if (typeof childName === 'number' || typeof childName === 'string') {
              const childPath = getCurrentPath(childName, path) as string;
              deepHandle(childField, childPath);
            }
          }
        }
      }
    };

    for (const key in properties) {
      const formField = properties[key];
      const childName = formatName(key, properties instanceof Array);
      if (typeof childName === 'number' || typeof childName === 'string') {
        const childPath = getCurrentPath(childName) as string;
        deepHandle(formField, childPath);
      }
    }
    setFieldPropsMap(fieldPropsMap);
  }

  // 展示计算完表达式之后的结果
  const showCalcFieldProps = (field: FormFieldProps, path?: string) => {
    return Object.fromEntries(
      Object.entries(field || {})?.map(
        ([propsKey]) => {
          const currentPath = propsKey ? `${path}.${propsKey}` : undefined
          const propsValue = (currentPath && fieldPropsMap[currentPath]) ?? field[propsKey]
          return [propsKey, propsValue];
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

  // 根据传递参数生成实例
  const createInstance = (target?: any, typeMap?: any, commonProps?: any, finalChildren?: any): any => {
    if (target instanceof Array) {
      return target?.map((item) => {
        return createInstance(item, typeMap, commonProps, finalChildren);
      });
    } else {
      const Child = componentParse(target, typeMap);
      // 声明组件
      if (Child) {
        const { children, ...restProps } = (target as FormComponent)?.props || {};
        return (
          <Child {...commonProps} {...restProps}>
            {children ? createInstance(children, typeMap, commonProps, finalChildren) : finalChildren}
          </Child>
        );
      } else {
        return isValidElement(target) ? target : null
      }
    }
  }

  // 从参数中获取声明组件
  const componentParse = <T,>(target: FieldUnionType | undefined, typeMap: T) => {
    // 是否为类或函数组件声明
    if (isReactComponent(target)) {
      return target
    }
    // 是否为已注册的组件声明
    if (typeof target === 'object') {
      const targetInfo = target as FormComponent;
      const hidden = calcExpression(targetInfo?.hidden);
      if (hidden === true) {
        return;
      }
      const register = typeMap && targetInfo?.type && typeMap[targetInfo?.type];
      if (register) {
        return register
      }
    }
  }

  const ignoreTag = { "data-type": "ignore" }
  // 给目标内部添加inside
  const withInside = (children: any, inside?: FieldUnionType, commonProps?: any) => {
    const childsWithList = renderList ? renderList?.({ ...commonProps, ...ignoreTag, children }) : children
    const childsWithSide = inside ? createInstance(inside, mergeComponents, { ...commonProps, ...ignoreTag }, childsWithList) : childsWithList;
    return childsWithSide;
  }

  // 给目标外面添加outside
  const withOutside = (children: any, outside?: FieldUnionType, commonProps?: any) => {
    const childWithItem = renderItem ? renderItem?.({ ...commonProps, ...ignoreTag, children }) : children
    const childWithSide = outside ? createInstance(outside, mergeComponents, { ...commonProps, ...ignoreTag }, childWithItem) : childWithItem;
    return childWithSide;
  }

  // 生成子元素
  const generateChild = (name: string | number, field: FormFieldProps, parent?: string) => {
    if (field?.hidden === true) {
      return;
    }
    const { readOnly, readOnlyRender, hidden, props, type, typeRender, properties, footer, suffix, fieldComponent, inside, outside, ...restField } = field;
    if (!field) return;

    const commonParams = { name, field, parent, store }; // 公共参数
    const footerInstance = createInstance(footer, mergeComponents, commonParams);
    const suffixInstance = createInstance(suffix, mergeComponents, commonParams);
    const fieldComponentParse = componentParse(fieldComponent, mergeComponents);
    // 表单域的传参
    const fieldProps = {
      key: name,
      name: name,
      onValuesChange: valuesCallback,
      footer: footerInstance,
      suffix: suffixInstance,
      component: fieldComponentParse,
      ignore: readOnly,
      ...restField
    }
    // 表单域组件
    const FormField = properties instanceof Array ? Form.List : Form.Item;
    // 表单域子元素
    const formItemChild = createInstance(typeRender || { type, props }, controls, commonParams)
    // 只读显示
    const readOnlyChild = createInstance(readOnlyRender, controls, commonParams)
    // 表单控件
    const fieldChild = readOnly === true ? readOnlyChild : formItemChild;
    // 容器传参
    const containerProps = { key: name, ...commonParams };
    // children
    let fieldChildren;
    if (typeof properties === 'object') {
      fieldChildren = renderChildrenList(properties, inside, commonParams)
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
  const renderChildrenList = (properties: FormFieldProps['properties'], inside: FieldUnionType | undefined, commonParams: GeneratePrams): any => {
    const { name, parent } = commonParams;
    const currentPath = getCurrentPath(name, parent);
    const childs = Object.entries(properties || {})?.map(([key, formField], index: number) => {
      const childName = formatName(key, properties instanceof Array);
      if (typeof childName === 'string' || typeof childName === 'number') {
        const childPath = getCurrentPath(childName, currentPath)
        const childField = showCalcFieldProps(formField, childPath);
        if (childField) {
          childField['index'] = index;
        }
        return generateChild(childName, childField, currentPath);
      }
    })
    return withInside(childs, inside, commonParams)
  }

  return renderChildrenList(properties, inside, { store });
}

RenderFormChildren.displayName = 'Form.Children';
