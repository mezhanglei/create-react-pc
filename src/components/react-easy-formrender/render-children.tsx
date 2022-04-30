import React, { useContext, useEffect, useState } from 'react';
import { FormFieldProps, RenderFormChildrenProps, SchemaData } from './types';
import { defaultFields } from './register';
import { AopFactory } from '@/utils/function-aop';
import { FormStoreContext, FormOptionsContext } from '../react-easy-formcore';
import { Row, Col } from 'react-flexbox-grid';

// 不带Form容器的组件
export default function RenderFormChildren(props: RenderFormChildrenProps) {

  const store = useContext(FormStoreContext)
  const options = useContext(FormOptionsContext)

  const [fieldPropsMap, setFieldPropsMap] = useState<Map<string, any>>(new Map());
  const [properties, setProperties] = useState<RenderFormChildrenProps['properties']>({});

  const {
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

  // 获取最新的表单数据
  useEffect(() => {
    setProperties(props?.properties)
  }, [JSON.stringify(props?.properties)]);

  // 变化时更新
  useEffect(() => {
    if (!store || !properties) return;
    handleFieldProps();
    initWatch();
    return () => {
      store?.removeListenStoreValue();
    }
  }, [store, JSON.stringify(properties)]);

  // 更新properties
  const updateProperties = (path: string, value: any) => {

  }

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

  // 递归遍历表单域的属性
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
  const showCalcFieldProps = (field: FormFieldProps, path?: string) => {
    return Object.fromEntries(
      Object.entries(field || {})?.map(
        ([propsKey]) => {
          const currentPath = path ? `${path}.${propsKey}` : propsKey;
          return [propsKey, fieldPropsMap.get(currentPath) ?? field[propsKey]];
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
        target = target?.replace(/\$form/g, 'store && store.getFieldValue()');
        const actionStr = "return " + target;
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

  // 生成组件的children
  const generateChildren = (children?: JSX.Element | { widget: string, widgetProps: FormFieldProps['widgetProps'] }[]) => {
    if (children instanceof Array) {
      return children?.map(({ widget, widgetProps }) => {
        const Child = widgets?.[widget];
        if (Child) {
          return <Child {...widgetProps} children={generateChildren(widgetProps?.children)} />;
        }
      });
    } else {
      return children;
    }
  }

  // 生成组件树
  const generateTree = (params: { name: string, field: FormFieldProps, path?: string }) => {
    const { name, field, path } = params || {};
    const currentPath = path ? `${path}.${name}` : name;
    const newField = showCalcFieldProps(field, currentPath);
    const { readOnly, readOnlyWidget, readOnlyRender, hidden, widgetProps, widget, properties, ...restField } = newField;

    const valuesCallback = aopOnValuesChange.addAfter(onValuesChange);
    const FormField = readOnly ? Fields?.['List.Item'] : (properties instanceof Array ? Fields['Form.List'] : Fields['Form.Item']);
    const FieldComponent = widget && widgets?.[widget];
    const { children, ...componentProps } = widgetProps || {};

    // 是否隐藏
    const hiddenResult = fieldPropsMap.get(`${currentPath}.hidden`);
    if (hiddenResult) return;
    // 是否只读
    if (readOnly === true) {
      const Child = readOnlyWidget && widgets[readOnlyWidget]
      return (
        <FormField {...restField} key={name}>
          {
            readOnlyRender ??
            (Child !== undefined && <Child />)
          }
        </FormField>
      );
    }

    return (
      <FormField {...restField} key={name} name={name} onValuesChange={valuesCallback}>
        {
          typeof properties === 'object' ?
            (
              properties instanceof Array ?
                properties?.map((formField, index) => {
                  return generateTree({ name: `${index}`, field: formField, path: currentPath });
                })
                :
                Object.entries(properties || {})?.map(
                  ([name, formField]) => {
                    return generateTree({ name: name, field: formField, path: currentPath });
                  }
                )
            ) :
            <FieldComponent {...componentProps}>{generateChildren(children)}</FieldComponent>
        }
      </FormField>
    );
  };

  // 渲染
  const getFormList = (properties: SchemaData['properties']) => {
    return (
      Object.entries(properties || {}).map(
        ([name, formField]) => {
          return generateTree({ name: name, field: formField });
        }
      )
    )
  }

  return getFormList(properties);
}
