import React, { useContext, useEffect, useState } from 'react';
import { FormFieldProps, RenderFormChildrenProps, SchemaData } from './types';
import { defaultFields } from './default-field';
import { AopFactory } from '@/utils/function-aop';
import { FormOptionsContext, FormStoreContext } from '../react-easy-formcore';
import { isListItem } from '../react-easy-formcore/utils/utils';
import { FormRenderStore } from './formrender-store';
import { isObjectEqual } from '@/utils/object';
import { isEmpty } from '@/utils/type';

// 不带Form容器的组件
export default function RenderFormChildren(props: RenderFormChildrenProps) {

  const store = useContext<FormRenderStore | undefined>(FormStoreContext)
  const options = useContext(FormOptionsContext)

  const [fieldPropsMap, setFieldPropsMap] = useState<Map<string, any>>(new Map());
  const [properties, setProperties] = useState<SchemaData['properties']>({});

  const {
    Fields = defaultFields,
    widgets,
    watch,
    childrenName = 'default',
    onPropertiesChange
  } = props;

  const {
    onValuesChange
  } = options;

  const aopOnValuesChange = new AopFactory(() => {
    handleFieldProps();
  });

  // 订阅更新properties的函数,j将传值更新到state里面
  useEffect(() => {
    if (!store || !childrenName) return
    // 订阅目标控件
    const uninstall = store.subscribeProperties(childrenName, (newValue, oldValue) => {
      setProperties(newValue);
      if (oldValue !== undefined && !isObjectEqual(newValue, oldValue)) {
        onPropertiesChange && onPropertiesChange(childrenName, newValue)
      }
    })
    return () => {
      uninstall()
    }
  }, [childrenName]);

  // 收集properties到store中
  useEffect(() => {
    if (store && props?.properties) {
      store.setProperties(childrenName, props?.properties)
    }
  }, [JSON.stringify(props?.properties)]);

  // 变化时更新
  useEffect(() => {
    if (!properties) return;
    handleFieldProps();
    initWatch();
    return () => {
      store?.removeListenStoreValue();
    }
  }, [JSON.stringify(properties)]);

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

  // 拼接当前项的path
  const getCurrentPath = (name?: string, parent?: string) => {
    if (name === undefined) return name;
    if (isListItem(name)) {
      return parent ? `${parent}${name}` : name;
    } else {
      return parent ? `${parent}.${name}` : name;
    }
  }

  // 获取依赖的值
  const getDependencies = (dependencies: string[]) => {
    const values = dependencies?.length ? {} : undefined;
    for (let i = 0; i < dependencies?.length; i++) {
      const pathStr = dependencies[i];
      if (values) {
        values[pathStr] = store?.getFieldValue(pathStr);
      }
    }
    return values;
  }

  // 生成组件树
  const generateTree = (params: { name: string, field: FormFieldProps, path?: string }) => {
    const { name, field, path } = params || {};
    const currentPath = getCurrentPath(name, path);
    const newField = showCalcFieldProps(field, currentPath);
    const { readOnly, readOnlyWidget, readOnlyRender, hidden, widgetProps, widget, properties, ...restField } = newField;

    const valuesCallback = aopOnValuesChange.addAfter(onValuesChange);
    const FormField = readOnly ? Fields?.['List.Item'] : (properties instanceof Array ? Fields['Form.List'] : Fields['Form.Item']);
    const FormItemChild = widget && widgets?.[widget];
    const { children, ...restWidgetProps } = widgetProps || {};
    const fieldChildProps = { ...params, ...restWidgetProps };
    // 是否隐藏
    const hiddenResult = fieldPropsMap.get(`${currentPath}.hidden`);
    if (hiddenResult) return;

    // 只读组件
    if (readOnly === true) {
      const ListItemChild = readOnlyWidget && widgets[readOnlyWidget]
      return (
        <FormField key={name} {...restField}>
          {
            readOnlyRender ??
            (ListItemChild !== undefined && <ListItemChild {...fieldChildProps} childrenname={childrenName} store={store} />)
          }
        </FormField>
      );
    }

    // 嵌套组件
    if (typeof properties === 'object' && !isEmpty(properties)) {
      return (
        <FormField key={name} {...restField} name={name} onValuesChange={valuesCallback}>
          {
            properties instanceof Array ?
              properties?.map((formField, index) => {
                return generateTree({ name: `[${index}]`, field: formField, path: currentPath });
              })
              :
              Object.entries(properties || {})?.map(
                ([name, formField]) => {
                  return generateTree({ name: name, field: formField as FormFieldProps, path: currentPath });
                }
              )
          }
        </FormField>
      )
      // widget组件
    } else {
      return (
        <FormField key={name} {...restField} name={name} onValuesChange={valuesCallback}>
          {FormItemChild ? <FormItemChild {...fieldChildProps} childrenname={childrenName} store={store}>{generateChildren(children)}</FormItemChild> : null}
        </FormField>
      )
    }
  };

  // 渲染
  const getFormList = (properties: SchemaData['properties']) => {
    return (
      <>
        {
          Object.entries(properties || {}).map(
            ([name, formField]) => {
              return generateTree({ name: name, field: formField });
            }
          )
        }
      </>
    )
  }

  return getFormList(properties);
}
