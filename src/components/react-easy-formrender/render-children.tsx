import React, { useContext, useEffect, useRef, useState } from 'react';
import { FormFieldProps, generateChildFunc, GenerateParams, getChildrenList, RenderFormChildrenProps, SchemaData, SlotParams, WidgetParams } from './types';
import { defaultFields, defaultSlotWidgets } from './components';
import { FormOptionsContext, FormStoreContext } from '../react-easy-formcore';
import { getColProps, getCurrentPath } from '../react-easy-formcore/utils/utils';
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
        const path = parent ? `${parent}.${key}` : key;
        if (key !== 'properties') {
          const result = calcExpression(value);
          fieldPropsMap[path] = result;
        } else {
          deepHandle(value, path);
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

  // 生成组件的children
  const generateChildren = (child?: Array<WidgetParams> | WidgetParams | any) => {
    if (child instanceof Array) {
      return child?.map(({ widget, widgetProps }) => {
        const Child = widgets?.[widget];
        if (Child) {
          return <Child {...widgetProps} children={generateChildren(widgetProps?.children)} />;
        }
      });
    } else {
      const renderParams = child as WidgetParams;
      const Child = widgets?.[renderParams?.widget];
      const ChildProps = renderParams?.widgetProps;
      if (Child) {
        return <Child {...ChildProps} children={generateChildren(ChildProps?.children)} />
      } else {
        return child
      }
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

  // 生成slot组件实例
  const generateSlot = (child: Array<SlotParams> | SlotParams | any): any => {
    if (child instanceof Array) {
      return child?.map((item) => {
        return generateSlot(item);
      });
    } else {
      const Child = slotWidgetsRegister[child?.type];
      // 注册组件
      if (Child) {
        const slotHidden = calcExpression(child?.hidden);
        if (slotHidden === true) {
          return;
        }
        const ChildProps = child?.props;
        return <Child {...ChildProps} children={generateSlot(ChildProps?.children)} />
        // 声明的组件
      } else if (typeof child?.render === 'function') {
        const Slot = child;
        return <Slot />;
      } else {
        return child;
      }
    }
  }

  // 内置按钮(目前只有增加和删除按钮)
  const getDefaultSlot = (child: SlotParams, params: GenerateParams) => {
    const type = child?.type;
    const slotProps = child?.props;
    if (type) {
      const { path, field } = params;
      const btnClick = () => {
        // 给列表增加按钮
        if (type === 'add') {
          const properties = field?.properties;
          const addItem = child?.addItem;
          const newField = addItem && { ...addItem };
          if (properties instanceof Array) {
            const len = properties?.length || 0;
            const newIndex = len;
            if (newField) {
              store?.addItemByIndex({ name: `${newIndex}`, field: newField }, newIndex, path)
            }
          } else if (typeof properties === 'object') {
            const len = Object?.keys(properties)?.length || 0;
            const newIndex = len;
            if (newField?.name) {
              store?.addItemByIndex({ name: newField?.name, field: newField }, newIndex, path);
            }
          }
          // 删除按钮
        } else if (type === 'delete') {
          path && store?.setFieldValue(path, undefined, true);
          path && store?.delItemByPath(path);
        }
      }
      const slotHidden = calcExpression(child?.hidden);
      if (slotHidden === true) {
        return;
      }
      const Slot = defaultSlotWidgets[type];
      return <Slot onClick={btnClick} children={type === 'add' && '新增一条'} {...slotProps} />
    }
  }

  // 生成表单控件
  const generateChild: generateChildFunc = (params, parent) => {
    const { name, field, path, index } = params || {};
    const { readOnly, readOnlyWidget, readOnlyRender, hidden, widgetProps, widget, properties, footer, suffix, ...restField } = field;

    const fieldType = getFieldType(readOnly, properties);
    const FormField = FieldsRegister[fieldType];
    const FormItemChild = widget && widgets?.[widget];
    const slotFooter = (footer?.type == 'add') ? getDefaultSlot(footer, params) : generateSlot(footer);
    const slotSuffix = (suffix?.type == 'delete') ? getDefaultSlot(suffix, params) : generateSlot(suffix);
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
        <FormField key={name} {...fieldProps} footer={slotFooter} suffix={slotSuffix}>
          {child}
        </FormField>
      );
    }

    // 列表组件
    if (typeof properties === 'object') {
      return (
        <FormField key={name} {...restField} name={name} onValuesChange={valuesCallback} footer={slotFooter} suffix={slotSuffix}>
          {renderChildrenList(properties, generateChild, { name, path: path, field: field, index })}
        </FormField>
      )
      // widget组件
    } else {
      const child = FormItemChild ? <FormItemChild {...fieldChildProps}>{generateChildren(children)}</FormItemChild> : null;
      return (
        <FormField key={name} {...restField} name={name} onValuesChange={valuesCallback} footer={slotFooter} suffix={slotSuffix}>
          {child}
        </FormField>
      )
    }
  };

  // 根据properties渲染子列表
  const renderChildrenList: getChildrenList = (properties, generate, parent) => {
    const { path } = parent || {};
    const childs = Object.entries(properties || {})?.map(([name, formField], index) => {
      name = properties instanceof Array ? `[${name}]` : name;
      const currentPath = getCurrentPath(name, path);
      const newField = showCalcFieldProps(formField, currentPath);
      const Wrapper = customChild as any;
      const childProps = { name: name, field: newField, path: currentPath, index };
      if (newField?.hidden === true) {
        return;
      }
      if (Wrapper) {
        const { col, ...restField } = newField;
        const childProps = { name: name, field: restField, path: currentPath, index };
        const colProps = getColProps({ layout: restField?.layout, col: col });
        return (
          <Wrapper data-type="fragment" key={name} {...colProps} {...childProps}>
            {generate(childProps, properties)}
          </Wrapper>
        );
      }
      return generate(childProps, properties);
    });
    const RenderList = customList as any;
    if (RenderList) {
      return <RenderList children={childs} parent={parent} properties={properties} />
    }
    return childs;
  }

  return renderChildrenList(properties, generateChild);
}
