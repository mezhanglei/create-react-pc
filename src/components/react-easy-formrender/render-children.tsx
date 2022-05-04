import React, { useContext, useEffect, useState } from 'react';
import { FormFieldProps, RenderFormChildrenProps, SchemaData } from './types';
import { defaultFields } from './register';
import { AopFactory } from '@/utils/function-aop';
import { FormOptionsContext, LabelAlignEnum } from '../react-easy-formcore';
import { Row, Col } from 'react-flexbox-grid';
import { isListItem } from '../react-easy-formcore/utils/utils';
import { FormRenderStoreContext } from './formrender-store';

// 不带Form容器的组件
export default function RenderFormChildren(props: RenderFormChildrenProps) {

  const store = useContext(FormRenderStoreContext)
  const options = useContext(FormOptionsContext)

  const [fieldPropsMap, setFieldPropsMap] = useState<Map<string, any>>(new Map());
  const [schema, setSchema] = useState<SchemaData>();
  const properties = schema?.properties || {};

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

  // 收集schema到store中
  useEffect(() => {
    if(store) {
      store.setStoreSchema(props?.schema)
    }
  }, [JSON.stringify(props?.schema)])

  // 订阅更新schema的函数
  useEffect(() => {
    if (!store) return
    // 订阅目标控件
    // const uninstall = store.subscribeValue(currentPath, (newValue, oldValue) => {
    //   setValue(newValue);
    //   // 不监听`initialValue`赋值
    //   if (oldValue !== undefined && !isObjectEqual(newValue, oldValue)) {
    //     onValuesChange && onValuesChange({ path: currentPath, value: newValue })
    //   }

    //   // setSchema(store?.schema)
    // })
    return () => {
      // uninstall()
    }
  }, [store]);

  // 变化时更新
  useEffect(() => {
    if (!schema) return;
    handleFieldProps();
    initWatch();
    return () => {
      store?.removeListenStoreValue();
    }
  }, [JSON.stringify(schema)]);

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

  const getGridProps = (field: FormFieldProps) => {
    const { xs, sm, md, lg, labelAlign, colspan } = field;
    const linespan = 12;
    // 默认
    const defaultspan = labelAlign !== LabelAlignEnum.Inline && (colspan ?? linespan);
    return {
      xs: xs !== undefined ? xs : defaultspan,
      sm: sm !== undefined ? sm : defaultspan,
      md: md !== undefined ? md : defaultspan,
      lg: lg !== undefined ? lg : defaultspan
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

  // 生成组件树
  const generateTree = (params: { name: string, field: FormFieldProps, path?: string }) => {
    const { name, field, path } = params || {};
    const currentPath = getCurrentPath(name, path);
    const newField = showCalcFieldProps(field, currentPath);
    const { readOnly, readOnlyWidget, readOnlyRender, hidden, widgetProps, widget, properties, ...restField } = newField;

    const valuesCallback = aopOnValuesChange.addAfter(onValuesChange);
    const FormField = readOnly ? Fields?.['List.Item'] : (properties instanceof Array ? Fields['Form.List'] : Fields['Form.Item']);
    const FieldComponent = widget && widgets?.[widget];
    const { children, ...componentProps } = widgetProps || {};

    // 是否隐藏
    const hiddenResult = fieldPropsMap.get(`${currentPath}.hidden`);
    if (hiddenResult) return;
    const gridProps = getGridProps(field);
    // 是否只读
    if (readOnly === true) {
      const Child = readOnlyWidget && widgets[readOnlyWidget]
      return (
        <Col {...gridProps} data-type='fragment' key={name} style={{ padding: 0 }}>
          <FormField {...restField}>
            {
              readOnlyRender ??
              (Child !== undefined && <Child />)
            }
          </FormField>
        </Col>
      );
    }

    return (
      <Col {...gridProps} data-type='fragment' key={name} style={{ padding: 0 }}>
        <FormField {...restField} name={name} onValuesChange={valuesCallback}>
          {
            typeof properties === 'object' ?
              (
                properties instanceof Array ?
                  properties?.map((formField, index) => {
                    return generateTree({ name: `[${index}]`, field: formField, path: currentPath });
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
      </Col>
    );
  };

  // 渲染
  const getFormList = (properties: SchemaData['properties']) => {
    return (
      <Row>
        {
          Object.entries(properties || {}).map(
            ([name, formField]) => {
              return generateTree({ name: name, field: formField });
            }
          )
        }
      </Row>
    )
  }

  return getFormList(properties);
}
