import React, { useContext, useEffect, useState } from 'react';
import { FormFieldProps, RenderFormChildrenProps, GeneratePrams, FieldUnionType, FormComponent, PropertiesData } from './types';
import { defaultComponents } from './components';
import { Form, formatName, FormOptionsContext, FormRule, FormStore, FormStoreContext, ItemCoreProps, joinPath } from '../react-easy-formcore';
import { useFormRenderStore } from './formrender-store';
import { isEqual } from '@/utils/object';
import { isReactComponent, isValidElement } from '@/utils/ReactIs';
import { matchExpression } from './utils/utils';

// 表单元素渲染
export default function RenderFormChildren(props: RenderFormChildrenProps) {

  const options = useContext(FormOptionsContext);
  const [fieldPropsMap, setFieldPropsMap] = useState<Partial<FormFieldProps>>({});
  const [properties, setProperties] = useState<PropertiesData>({});

  const {
    uneval,
    controls,
    components,
    watch,
    onPropertiesChange,
    renderItem,
    renderList,
    inside,
    properties: propertiesProps,
    store
  } = props;

  const form = useContext<FormStore>(FormStoreContext);
  const formRenderStore = store || useFormRenderStore()

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
    if (!formRenderStore) return
    // 订阅目标控件
    const uninstall = formRenderStore.subscribeProperties((newValue, oldValue) => {
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
    if (formRenderStore) {
      formRenderStore.setProperties(propertiesProps)
    }
  }, [propertiesProps]);

  // 变化时更新
  useEffect(() => {
    if (!properties) return;
    handleFieldProps();
    initWatch();
    return () => {
      form?.unsubscribeFormGlobal();
    }
  }, [properties]);

  // 初始化监听
  const initWatch = () => {
    Object.entries(watch || {})?.map(([key, watcher]) => {
      // 函数形式
      if (typeof watcher === 'function') {
        form?.subscribeFormGlobal(key, watcher)
        // 对象形式
      } else if (typeof watcher === 'object') {
        if (typeof watcher.handler === 'function') {
          form?.subscribeFormGlobal(key, watcher.handler);
        }
        if (watcher.immediate) {
          watcher.handler(form?.getFieldValue(key), form?.getLastValue(key));
        }
      }
    });
  }

  // 遍历处理rules字段
  const evalRules = (rules: FormRule[]) => {
    if (!(rules instanceof Array)) return;
    const newRules = rules?.map((rule) => {
      const newRule = {};
      if (rule) {
        for (let key in rule) {
          newRule[key] = evalExpression(rule[key], uneval)
        }
        return newRule;
      }
    });
    return newRules;
  }

  // 遍历处理props字段
  const evalProps = (val?: any) => {
    const newProps = {};
    if (val) {
      for (let key in val) {
        const propsItem = val?.[key];
        newProps[key] = evalExpression(propsItem, uneval);
      }
      return newProps;
    }
  }

  // 递归遍历表单域的属性
  const handleFieldProps = () => {
    const fieldPropsMap = {};
    // 遍历处理对象树中的非properties字段
    const deepHandle = (formField: FormFieldProps, path: string) => {
      for (const propsKey in formField) {
        if (typeof propsKey === 'string') {
          if (propsKey !== 'properties') {
            const propsValue = formField[propsKey];
            const propsPath = joinPath(path, propsKey) as string;
            let result = propsValue;
            const evalStr = matchExpression(propsValue);
            if (evalStr) {
              result = evalExpression(propsValue, uneval);
            } else if (propsKey === 'props') {
              result = evalProps(propsValue);
            } else if (propsKey === 'rules') {
              result = evalRules(propsValue);
            }
            fieldPropsMap[propsPath] = result;
          } else {
            const children = formField[propsKey];
            for (const childKey in children) {
              const childField = children[childKey];
              const childName = formatName(childKey, children instanceof Array);
              if (typeof childName === 'number' || typeof childName === 'string') {
                const childPath = joinPath(path, childName) as string;
                deepHandle(childField, childPath);
              }
            }
          }
        }
      }
    };

    for (const key in properties) {
      const formField = properties[key];
      const childName = formatName(key, properties instanceof Array);
      if (typeof childName === 'number' || typeof childName === 'string') {
        const childPath = joinPath(childName) as string;
        deepHandle(formField, childPath);
      }
    }
    setFieldPropsMap(fieldPropsMap);
  }

  // 获取计算完表达式之后的结果
  const getEvalFieldProps = (field: FormFieldProps, path?: string) => {
    return Object.fromEntries(
      Object.entries(field || {})?.map(
        ([propsKey]) => {
          const currentPath = propsKey && path ? `${path}.${propsKey}` : undefined
          const propsValue = (currentPath && fieldPropsMap[currentPath]) ?? field[propsKey]
          return [propsKey, propsValue];
        }
      )
    );
  }

  // 值兼容字符串表达式
  const evalExpression = (value?: string | boolean, uneval?: boolean) => {
    if (uneval) return value;
    if (typeof value === 'string') {
      const evalStr = matchExpression(value)
      if (evalStr) {
        let target = evalStr?.replace(/\{\{|\}\}|\s*/g, '');
        target = target?.replace(/\$formvalues/g, 'form && form.getFieldValue()');
        target = target?.replace(/\$form/g, 'form');
        target = target?.replace(/\$store/g, 'store');
        const actionStr = "return " + target;
        // 函数最后一个参数为函数体，前面均为传入的变量名
        const action = new Function('form', 'store', actionStr);
        const value = action(form, formRenderStore);
        return value;
      } else {
        return value;
      }
    } else {
      return value;
    }
  }

  // 根据传递参数生成实例
  const createInstance = (target?: any, typeMap?: { [key: string]: React.ElementType }, commonProps?: any, finalChildren?: any): any => {
    if (target instanceof Array) {
      return target?.map((item) => {
        return createInstance(item, typeMap, commonProps, finalChildren);
      });
    } else {
      const Child = componentParse(target, typeMap) as React.ElementType;
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
  const componentParse = (target: FieldUnionType | undefined, typeMap?: { [key: string]: React.ElementType }) => {
    // 是否为类或函数组件声明
    if (isReactComponent(target)) {
      return target
    }
    // 是否为已注册的组件声明
    if (typeof target === 'object') {
      const targetInfo = target as FormComponent;
      const hidden = evalExpression(targetInfo?.hidden, uneval);
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
  // 目标套上其他组件
  const withSide = (children: any, side?: FieldUnionType, render?: (params: GeneratePrams<any>) => any, commonProps?: any) => {
    const childs = render ? render?.({ ...commonProps, ...ignoreTag, children }) : children
    const childsWithSide = side ? createInstance(side, mergeComponents, { ...commonProps, ...ignoreTag }, childs) : childs;
    return childsWithSide;
  }

  // 生成子元素
  const generateChild = (name: string | number, field: FormFieldProps, parent?: string, formparent?: string) => {
    if (field?.hidden === true) {
      return;
    }
    const { readOnly, readOnlyRender, hidden, props, type, typeRender, properties, footer, suffix, fieldComponent, inside, outside, ...restField } = field;
    if (!field) return;

    const commonParams = { name, field: { ...options, ...field }, parent, formparent, form: form, store: formRenderStore }; // 公共参数
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
    // 控件元素
    const formItemChild = createInstance(typeRender || { type, props }, controls, commonParams)
    // 只读显示
    const readOnlyChild = createInstance(readOnlyRender, controls, commonParams)
    // 表单域包裹目标
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
      <FormField {...fieldProps}>
        {fieldChildren}
      </FormField>
    );
    return withSide(result, outside, renderItem, containerProps)
  }

  // 渲染children
  const renderChildrenList = (properties: FormFieldProps['properties'], inside: FieldUnionType | undefined, commonParams: GeneratePrams): any => {
    const { name, parent, formparent, field } = commonParams;
    const currentPath = joinPath(parent, name);
    const formPath = joinPath(formparent, field?.ignore ? undefined : name);
    const childs = Object.entries(properties || {})?.map(([key, formField], index: number) => {
      const childName = formatName(key, properties instanceof Array);
      if (typeof childName === 'string' || typeof childName === 'number') {
        const childPath = joinPath(currentPath, childName);
        const childField = getEvalFieldProps(formField, childPath);
        if (childField) {
          childField['index'] = index;
        }
        return generateChild(childName, childField, currentPath, formPath);
      }
    });
    return withSide(childs, inside, renderList, commonParams)
  }

  return renderChildrenList(properties, inside, { store: formRenderStore, form: form });
}

RenderFormChildren.displayName = 'Form.Children';
