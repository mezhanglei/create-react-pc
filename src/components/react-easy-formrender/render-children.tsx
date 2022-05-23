import React, { useContext, useEffect, useRef, useState } from 'react';
import { FormFieldProps, generateChildFunc, getChildrenList, RenderFormChildrenProps, SchemaData, ValueOf } from './types';
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

  const [fieldPropsMap, setFieldPropsMap] = useState<Map<string, ValueOf<FormFieldProps>>>(new Map());
  const [dependValuesMap, setDependValuesMap] = useState<Map<string, any>>(new Map());
  const [properties, setProperties] = useState<SchemaData['properties']>({});
  const isMountRef = useRef<boolean>(true);

  const {
    Fields,
    widgets,
    watch,
    onPropertiesChange,
    customRender
  } = props;

  const FieldsRegister = { ...defaultFields, ...Fields };

  const {
    onValuesChange
  } = options;

  const aopOnValuesChange = new AopFactory(() => {
    handleFieldProps();
  });

  // 订阅更新properties的函数,j将传值更新到state里面
  useEffect(() => {
    if (!store) return
    // 订阅目标控件
    const uninstall = store.subscribeProperties((newValue, oldValue) => {
      setProperties(newValue);
      if (!isMountRef.current && !isObjectEqual(newValue, oldValue)) {
        onPropertiesChange && onPropertiesChange(newValue, oldValue)
      }
    })
    return () => {
      uninstall()
    }
  }, []);

  // 收集properties到store中
  useEffect(() => {
    if (store && props?.properties) {
      store.setProperties(props?.properties)
      isMountRef.current = false;
    }
  }, [JSON.stringify(props?.properties)]);

  // 变化时更新
  useEffect(() => {
    if (!properties) return;
    handleFieldProps();
    initWatch();
    return () => {
      store?.removeListenFormGlobal();
    }
  }, [JSON.stringify(properties)]);

  // 初始化监听
  const initWatch = () => {
    Object.entries(watch || {})?.map(([key, watcher]) => {
      // 函数形式
      if (typeof watcher === 'function') {
        store?.listenFormGlobal(key, watcher)
        // 对象形式
      } else if (typeof watcher === 'object') {
        if (typeof watcher.handler === 'function') {
          store?.listenFormGlobal(key, watcher.handler);
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
    const dependValuesMap = new Map();
    // 遍历处理对象树中的非properties字段
    const deepHandle = (formField: FormFieldProps, parent: string) => {
      for (const key in formField) {
        const value = formField[key];
        if (key !== 'properties') {
          const path = parent ? `${parent}.${key}` : key;
          const result = calcExpression(value);
          fieldPropsMap.set(path, result);
          if (key === 'dependencies') {
            const dependValues = getDependencies(result);
            dependValuesMap.set(parent, dependValues);
          }
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
    setDependValuesMap(dependValuesMap);
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
  const getCurrentPath = (name: string, parent?: string) => {
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
      if (values && pathStr) {
        values[pathStr] = store?.getFieldValue(pathStr);
      }
    }
    return values;
  }

  // 获取field的类型
  const getFieldType = (readOnly?: boolean, properties?: SchemaData['properties']) => {
    if (readOnly) {
      return 'List.Item';
    }
    if (properties instanceof Array) {
      return 'Form.List'
    }
    return 'Form.Item';
  }

  // 生成表单控件
  const generateChild: generateChildFunc = (params, index) => {
    const { name, field, path } = params || {};
    const currentPath = getCurrentPath(name, path);
    const newField = showCalcFieldProps(field, currentPath);
    const { readOnly, readOnlyWidget, readOnlyRender, hidden, widgetProps, widget, properties, ...restField } = newField;

    const valuesCallback = aopOnValuesChange.addAfter(onValuesChange);
    const fieldType = getFieldType(readOnly, properties);
    const FormField = FieldsRegister[fieldType];
    const FormItemChild = widget && widgets?.[widget];
    const { children, ...restWidgetProps } = widgetProps || {};
    const fieldChildProps = { ...params, ...restWidgetProps };
    // 依赖的值
    const dependvalues = dependValuesMap.get(currentPath);
    // 是否隐藏
    const hiddenResult = fieldPropsMap.get(`${currentPath}.hidden`);
    if (hiddenResult || !FormField || !newField) return;

    // 只读组件
    if (readOnly === true) {
      const ListItemChild = readOnlyWidget && widgets[readOnlyWidget]
      // 当fieldType === 'Form.Item'的传参
      const { rules, initialValue, ...listItemProps } = restField;
      return (
        <FormField key={name} {...(fieldType === 'Form.Item' ? restField : listItemProps)}>
          {
            readOnlyRender ??
            (ListItemChild !== undefined && <ListItemChild {...fieldChildProps} dependvalues={dependvalues} store={store} />)
          }
        </FormField>
      );
    }

    // 嵌套组件
    if (typeof properties === 'object' && !isEmpty(properties)) {
      return (
        <FormField key={name} {...restField} name={name} onValuesChange={valuesCallback}>
          {renderChildrenList(properties, generateChild, { name, path: currentPath, field: newField }, index)}
        </FormField>
      )
      // widget组件
    } else {
      return (
        <FormField key={name} {...restField} name={name} onValuesChange={valuesCallback}>
          {FormItemChild ? <FormItemChild {...fieldChildProps} dependvalues={dependvalues} store={store}>{generateChildren(children)}</FormItemChild> : null}
        </FormField>
      )
    }
  };

  // 根据properties渲染子列表
  const renderChildrenList: getChildrenList = (properties, generate, parent, itemIndex) => {
    if (customRender) {
      return customRender(properties, generate, parent, itemIndex);
    }
    const { path } = parent || {};
    return (
      properties instanceof Array ?
        properties?.map((formField, index) => {
          return generate({ name: `[${index}]`, field: formField, path }, index);
        })
        :
        Object.entries(properties || {})?.map(
          ([name, formField], index) => {
            return generate({ name: name, field: formField, path }, index);
          }
        )
    )
  }

  return renderChildrenList(properties, generateChild);
}
