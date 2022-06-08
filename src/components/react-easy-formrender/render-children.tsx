import React, { useContext, useEffect, useRef, useState } from 'react';
import { FormFieldProps, generateChildFunc, getChildrenList, RenderFormChildrenProps, SchemaData } from './types';
import { defaultFields, defaultSlotWidgets } from './default-components';
import { FormOptionsContext, FormStoreContext } from '../react-easy-formcore';
import { getColProps, getCurrentPath } from '../react-easy-formcore/utils/utils';
import { FormRenderStore } from './formrender-store';
import { isEqual } from '@/utils/object';

// 不带Form容器的组件
export default function RenderFormChildren(props: RenderFormChildrenProps) {

  const store = useContext<FormRenderStore | undefined>(FormStoreContext);
  const options = useContext(FormOptionsContext);

  const [fieldPropsMap, setFieldPropsMap] = useState<Partial<FormFieldProps>>({});
  const [properties, setProperties] = useState<SchemaData['properties']>({});
  const isMountRef = useRef<boolean>(true);

  const {
    Fields,
    widgets,
    slotWidgets,
    watch,
    onPropertiesChange,
    customList,
    customChild
  } = props;

  const FieldsRegister = { ...defaultFields, ...Fields };
  const slotWidgetsRegister = { ...defaultSlotWidgets, ...slotWidgets };

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
      if (!isMountRef.current && !isEqual(newValue, oldValue)) {
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
      for (const key in formField) {
        const value = formField[key];
        if (key !== 'properties') {
          const path = parent ? `${parent}.${key}` : key;
          const result = calcExpression(value);
          fieldPropsMap[path] = result;
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
        target = target?.replace(/\$form/g, 'store && store.getFieldValue()');
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

  // 获取field的类型
  const getFieldType = (readOnly?: boolean, properties?: SchemaData['properties']) => {
    if (readOnly) {
      return 'List.Item';
    }
    if (properties instanceof Array) {
      return 'Form.List';
    }
    return 'Form.Item';
  }

  // 生成表单控件
  const generateChild: generateChildFunc = (params) => {
    const { name, field, path, index } = params || {};
    const currentPath = getCurrentPath(name, path);
    const { readOnly, readOnlyWidget, readOnlyRender, hidden, widgetProps, widget, properties, ...restField } = field;

    const fieldType = getFieldType(readOnly, properties);
    const FormField = FieldsRegister[fieldType];
    const FormItemChild = widget && widgets?.[widget];
    // 是否隐藏
    if (!FormField || !field) return;

    // 传给widget的props
    const { children, ...restWidgetProps } = widgetProps || {};
    const formvalues = store?.getFieldValue();
    const fieldChildProps = { ...params, ...restWidgetProps, formvalues, store };

    // 只读组件
    if (readOnly === true) {
      const ListItemChild = readOnlyWidget && widgets?.[readOnlyWidget]
      // 当fieldType === 'Form.Item'的传参
      const { rules, initialValue, ...listItemProps } = restField;
      const fieldProps = fieldType === 'Form.Item' ? restField : listItemProps;
      const child = readOnlyRender ?? (ListItemChild !== undefined && <ListItemChild {...fieldChildProps} />);
      return (
        <FormField key={name} {...fieldProps}>
          {child}
        </FormField>
      );
    }

    // 列表组件
    if (typeof properties === 'object') {
      return (
        <FormField key={name} {...restField} name={name} onValuesChange={valuesCallback}>
          {renderChildrenList(properties, generateChild, { name, path: currentPath, field: field, index })}
        </FormField>
      )
      // widget组件
    } else {
      const child = FormItemChild ? <FormItemChild {...fieldChildProps}>{generateChildren(children)}</FormItemChild> : null;
      return (
        <FormField key={name} {...restField} name={name} onValuesChange={valuesCallback}>
          {child}
        </FormField>
      )
    }
  };

  // 根据properties渲染子列表
  const renderChildrenList: getChildrenList = (properties, generate, parent) => {
    const { path } = parent || {};
    const childs = Object.entries(properties || {})?.map(([name, formField], index) => {
      const currentPath = getCurrentPath(name, path);
      const newField = showCalcFieldProps(formField, currentPath);
      const Wrapper = customChild as any;
      const childProps = { name: name, field: newField, path, index };
      if (newField?.hidden === true) {
        return;
      }
      if (Wrapper) {
        const { col, ...restField } = newField;
        const childProps = { name: name, field: restField, path, index };
        const colProps = getColProps({ layout: restField?.layout, col: col });
        return (
          <Wrapper data-type="fragment" key={name} {...colProps} {...childProps}>
            {generate(childProps)}
          </Wrapper>
        );
      }
      return generate(childProps);
    });
    const RenderList = customList as any;
    if (RenderList) {
      return <RenderList children={childs} parent={parent} properties={properties} />
    }
    return childs;
  }

  return renderChildrenList(properties, generateChild);
}
