import React, { useContext, useEffect, useState } from 'react';
import { ChildrenComponent, FormFieldProps, RenderFormChildrenProps, SchemaData } from './types';
import { defaultFields } from './register';
import { AopFactory } from '@/utils/function-aop';
import { isEmpty } from '@/utils/type';
import { FormStoreContext, FormOptionsContext } from '../react-easy-formcore';

// 不带Form容器的组件
export default function RenderFormChildren(props: RenderFormChildrenProps) {

  const store = useContext(FormStoreContext)
  const options = useContext(FormOptionsContext)

  const [fieldPropsMap, setFieldPropsMap] = useState<Map<string, any>>(new Map());

  const {
    children,
    properties,
    Fields = defaultFields,
    widgets,
    watch
  } = props;

  const {
    onValuesChange
  } = options;

  const aopOnValuesChange = new AopFactory(() => {
    handleFieldProps();
  });

  useEffect(() => {
    if (!store) return;
    handleFieldProps();
    initWatch();
    return () => {
      store?.removeListenStoreValue();
    }
  }, [store, JSON.stringify(properties)]);

  // 初始化监听
  const initWatch = () => {
    Object.entries(watch || {})?.map(([key, watcher]) => {
      // 函数形式
      if (typeof watcher === 'function') {
        store?.listenStoreValue(key, watcher)
        // 对象形式
      } else if (typeof watcher === 'object') {
        if (typeof watcher.handler === 'function') {
          store?.listenStoreValue(key, watcher.handler);
        }
        if (watcher.immediate) {
          watcher.handler(store?.getFieldValue(key), store?.getLastValue(key));
        }
      }
    });
  }

  // 遍历表单域的属性
  const handleFieldProps = () => {
    const fieldPropsMap = new Map();
    // 遍历处理对象树中的非properties字段
    const deepHandle = (formField: FormFieldProps, parent: string) => {
      for (const key in formField) {
        const value = formField[key];
        if (key !== 'properties') {
          const path = parent ? `${parent}.${key}` : key;
          const result = calcExpression(value);
          fieldPropsMap.set(path, result);
        } else {
          if (value instanceof Array) {
            for (let i = 0; i < value?.length; i++) {
              const formField = value[i];
              const path = `${parent}.${i}`;
              deepHandle(formField, path);
            }
          } else {
            for (const key in value) {
              const formField = value[key];
              const path = `${parent}.${key}`;
              deepHandle(formField, path);
            }
          }
        }
      }
    };

    for (const key in properties) {
      const formField = properties[key];
      deepHandle(formField, key);
    }
    setFieldPropsMap(fieldPropsMap);
  }

  // 展示计算完表达式之后的结果
  const showCalcFieldProps = (field?: object, path?: string) => {
    let newField;
    if (fieldPropsMap?.size && field) {
      newField = Object.fromEntries(
        Object.entries(field)?.map(
          ([name]) => {
            return [name, fieldPropsMap.get(`${path}.${name}`)];
          }
        )
      );
    }
    return newField;
  }

  // 值兼容字符串表达式
  const calcExpression = (target?: string | boolean) => {
    if (typeof target === 'string') {
      const reg = new RegExp('\{\{\s*.*?\s*\}\}', 'gi');
      const hiddenStr = target?.match(reg)?.[0];
      if (hiddenStr) {
        let target = hiddenStr?.replace(/\{\{|\}\}|\s*/g, '');
        target = target?.replace(/\$form/g, 'store && store.getFieldValue()');
        const actionStr = "return " + target;
        const action = new Function('store', actionStr);
        const value = action(store);
        return value;
      } else {
        return target;
      }
    } else {
      return target;
    }
  }

  // 生成组件的children
  const generateChildren = (children?: ChildrenComponent['props']['children']) => {
    if (children instanceof Array) {
      return children?.map(({ component, props }) => {
        const Child = widgets?.[component];
        return <Child {...props} children={generateChildren(props?.children)} />;
      });
    } else {
      return children;
    }
  }

  // 生成最小单元
  const renderFormItem = (params: { name: string, itemField: FormFieldProps, path?: string }) => {
    const { name, itemField, path } = params || {};
    const { component, props, ...fieldProps } = itemField;
    const { children, ...componentProps } = props || {};
    const FormField = Fields?.['Form.Item'];
    const FormComponent = component && widgets?.[component];
    const newField = showCalcFieldProps(fieldProps, path);
    const valuesCallback = aopOnValuesChange.addAfter(onValuesChange);

    return (
      <FormField {...fieldProps} {...newField} key={name} name={name} onValuesChange={valuesCallback}>
        <FormComponent {...componentProps}>{generateChildren(children)}</FormComponent>
      </FormField>
    );
  }

  // 自定义列表
  const renderListItem = (params: { name: string, itemField: FormFieldProps, path?: string }) => {
    const { name, itemField, path } = params || {};
    const FormField = Fields?.['List.Item'];
    const { render, ...fieldProps } = itemField;
    const newField = showCalcFieldProps(itemField, path);

    return (
      <FormField {...fieldProps} {...newField} key={name}>
        {render}
      </FormField>
    )
  }

  // 生成properties
  const renderProperties = (params: { name: string, propertiesField: FormFieldProps, path?: string }) => {
    const { name, propertiesField, path } = params || {};
    const { properties, component, props, render, ...fieldProps } = propertiesField;
    let FormField;
    if (properties instanceof Array) {
      FormField = Fields['Form.List']
    } else {
      FormField = Fields['Form.Item']
    }
    const newField = showCalcFieldProps(fieldProps, path);
    const valuesCallback = aopOnValuesChange.addAfter(onValuesChange);

    return (
      <FormField {...fieldProps} {...newField} key={name} name={name} onValuesChange={valuesCallback}>
        {
          properties instanceof Array ?
            properties?.map((formField, index) => {
              return generateTree({ name: `${index}`, field: formField, path: path });
            })
            :
            Object.entries(properties || {})?.map(
              ([name, formField]) => {
                return generateTree({ name: name, field: formField, path: path });
              }
            )
        }
      </FormField>
    );
  }

  // 生成组件树
  const generateTree = (params: { name: string, field: FormFieldProps, path?: string }) => {
    const { name, field, path } = params || {};
    const { hidden, readOnly, ...propertiesField } = field;
    const { properties, ...itemField } = propertiesField || {};
    const currentPath = path ? `${path}.${name}` : name;

    // 是否隐藏
    const hiddenResult = fieldPropsMap.get(`${currentPath}.hidden`);
    if (hiddenResult) return;
    // 是否只读
    if (readOnly === true) {
      return renderListItem({ name: name, itemField: itemField, path: currentPath });
    }

    if (typeof properties === 'object') {
      return !isEmpty(properties) && renderProperties({ name: name, propertiesField: propertiesField, path: currentPath })
    } else {
      return renderFormItem({ name: name, itemField: itemField, path: currentPath });
    }
  };

  // 渲染
  const getFormList = (properties: SchemaData['properties'], render: (params: { name: string, field: FormFieldProps, path?: string }) => any) => {
    return Object.entries(properties || {}).map(
      ([name, formField]) => {
        return render({ name: name, field: formField });
      }
    );
  }

  return (
    typeof children === 'function'
      ?
      children(properties, generateTree)
      :
      getFormList(properties, generateTree)
  );
}
