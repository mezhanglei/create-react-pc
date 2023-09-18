import React, { useContext, useEffect, useState } from 'react';
import { FormNodeProps, RenderFormProps, GeneratePrams, PropertiesData, GenerateFormNodeProps, CustomUnionType, CustomRenderType } from './types';
import { defaultComponents } from './components';
import { Form, FormOptionsContext, FormStore, FormStoreContext, ItemCoreProps, joinFormPath } from '../react-easy-formcore';
import { useFormRenderStore } from './use-formrender';
import { isEqual } from '@/utils/object';
import { matchExpression } from './utils/utils';
import { isEmpty, isObject } from '@/utils/type';

// 表单元素渲染
export default function RenderFormChildren(props: RenderFormProps) {

  const [fieldPropsMap, setFieldPropsMap] = useState<Partial<FormNodeProps>>({});
  const [properties, setProperties] = useState<PropertiesData>({});

  const {
    uneval,
    components,
    watch,
    onPropertiesChange,
    renderItem,
    renderList,
    inside,
    properties: propsProperties,
    form,
    formrender,
    expressionImports = {},
    options,
    evalPropNames = ['props', 'rules'],
  } = props;

  const formOptions = useContext(FormOptionsContext);
  const formStore = form || useContext<FormStore>(FormStoreContext);
  const formRenderStore = formrender || useFormRenderStore();
  const { onValuesChange } = formOptions;
  formRenderStore.registry('components', Object.assign({}, defaultComponents, components));

  const valuesCallback: ItemCoreProps['onValuesChange'] = (...args) => {
    onValuesChange && onValuesChange(...args)
    handleFieldProps();
  }

  useEffect(() => {
    if (!formStore || !watch) return;
    Object.entries(watch)?.map(([key, watcher]) => {
      // 函数形式
      if (typeof watcher === 'function') {
        formStore?.subscribeFormValue(key, watcher)
        // 对象形式
      } else if (isObject(watcher)) {
        if (typeof watcher.handler === 'function') {
          formStore?.subscribeFormValue(key, watcher.handler);
        }
        if (watcher.immediate) {
          watcher.handler(formStore?.getFieldValue(key), formStore?.getLastValue(key));
        }
      }
    });
    return () => {
      Object.entries(watch || {})?.forEach(([key]) => {
        formStore?.unsubscribeFormValue(key);
      });
    }
  }, [formStore, watch]);

  // 从formRenderStore中订阅更新properties
  useEffect(() => {
    if (!formRenderStore) return
    formRenderStore.subscribeProperties((newValue, oldValue) => {
      setProperties(newValue);
      if (!isEqual(newValue, oldValue)) {
        onPropertiesChange && onPropertiesChange(newValue, oldValue)
      }
    })
    return () => {
      formRenderStore?.unsubscribeProperties();
    }
  }, [formRenderStore, onPropertiesChange]);

  // 从props中更新properties
  useEffect(() => {
    if (!formRenderStore) return;
    formRenderStore.setProperties(propsProperties);
  }, [propsProperties]);

  // 变化时更新
  useEffect(() => {
    if (!properties) return;
    handleFieldProps();
  }, [properties]);

  // 递归检测对象
  const evalAttr = (val: Object | Array<any>): any => {
    if (val instanceof Array) {
      return val.map((item) => {
        return evalAttr(item);
      });
    } else if (isObject(val)) {
      return Object.fromEntries(
        Object.entries(val || {})?.map(
          ([propsKey, propsItem]) => {
            return [propsKey, evalAttr(propsItem)]
          }
        )
      );
    } else {
      const generateItem = evalExpression(val, uneval);
      return generateItem;
    }
  }

  // 递归遍历处理表单域的字符串表达式并存储解析后的信息
  const handleFieldProps = () => {
    if (!properties) return;
    const fieldPropsMap = {};
    // 遍历处理对象树中的非properties字段
    const deepHandle = (formNode: FormNodeProps, path: string) => {
      for (const propsKey of Object.keys(formNode || {})) {
        if (typeof propsKey === 'string') {
          if (propsKey !== 'properties') {
            const propsValue = formNode[propsKey];
            let result = propsValue;
            const matchStr = matchExpression(propsValue);
            if (matchStr) {
              result = evalExpression(propsValue, uneval);
            } else if (evalPropNames.includes(propsKey)) {
              result = evalAttr(propsValue);
            }
            const propsPath = joinFormPath(path, propsKey);
            fieldPropsMap[propsPath] = result;
          } else {
            const childProperties = formNode[propsKey];
            if (childProperties) {
              for (const childKey of Object.keys(childProperties)) {
                const childField = childProperties[childKey];
                const childName = childKey;
                if (typeof childName === 'number' || typeof childName === 'string') {
                  const childPath = joinFormPath(path, childName) as string;
                  deepHandle(childField, childPath);
                }
              }
            }
          }
        }
      }
    };

    for (const key of Object.keys(properties)) {
      const childField = properties[key];
      const childName = key;
      if (typeof key === 'string') {
        deepHandle(childField, childName);
      }
    }
    setFieldPropsMap(fieldPropsMap);
  }

  // 获取计算表达式之后的结果
  const getEvalFieldProps = (field: FormNodeProps, path?: string) => {
    if (!path || isEmpty(field)) return;
    return Object.fromEntries(
      Object.entries(field || {})?.map(
        ([propsKey, propsValue]) => {
          const propsPath = joinFormPath(path, propsKey);
          const generateValue = propsPath && fieldPropsMap[propsPath];
          const matchStr = matchExpression(propsValue);
          // 匹配上表达式或表达式值的映射则返回映射值
          if (matchStr || generateValue !== undefined) {
            if (propsKey === 'valueSetter' || propsKey === 'valueGetter') {
              return [propsKey, generateValue ? generateValue : () => undefined]
            }
            return generateValue == undefined ? [propsKey] : [propsKey, generateValue]
          }
          return [propsKey, propsValue];
        }
      )
    );
  }

  // 值兼容字符串表达式
  const evalExpression = (value?: unknown, uneval?: boolean): any => {
    if (uneval) return value;
    if (typeof value === 'string') {
      const matchStr = matchExpression(value)
      if (matchStr) {
        const importsKeys = ['form', 'formrender', 'formvalues'].concat(Object.keys(expressionImports))
        const importsValues = Object.values(expressionImports);
        const target = matchStr?.replace(/\{\{|\}\}/g, '');
        const actionStr = "return " + target;
        // 函数最后一个参数为函数体，前面均为传入的变量名
        const action = new Function(...importsKeys, actionStr);
        const result = action(formStore, formRenderStore, formStore && formStore.getFieldValue() || {}, ...importsValues);
        return evalExpression(result, uneval);
      } else {
        return value;
      }
    } else {
      return value;
    }
  }

  const ignoreTag = { "data-type": "ignore" }
  // 目标套上其他组件
  const withSide = (children: any, side?: CustomUnionType, render?: CustomRenderType, commonProps?: GeneratePrams) => {
    const childs = typeof render === 'function' ? render?.(Object.assign({ children }, commonProps)) : children;
    const sideInstance = side && formRenderStore.componentInstance(side, Object.assign({}, commonProps, ignoreTag));
    const childsWithSide = React.isValidElement(sideInstance) ? React.cloneElement(sideInstance, { children: childs } as Partial<unknown>) : childs;
    const cloneChilds = React.isValidElement(childsWithSide) ? React.cloneElement(childsWithSide, { key: commonProps?.path }) : childsWithSide;
    return cloneChilds;
  }

  // 生成子元素
  const generateChild = (name: string, path: string, field: GenerateFormNodeProps, parent?: GeneratePrams['parent']) => {
    if (field?.hidden === true || !field) return;
    const mergeOptions = Object.assign({}, typeof options === 'function' ? options(field) : options, formOptions);
    const mergeField = Object.assign({}, mergeOptions, field, { props: Object.assign({}, mergeOptions?.props, field?.props) })
    const commonParams = {
      name,
      path,
      field: mergeField,
      parent,
      form: formStore,
      formrender: formRenderStore
    }; // 公共参数
    const {
      readOnlyRender,
      hidden,
      props,
      type,
      typeRender,
      properties,
      footer,
      suffix,
      component,
      inside,
      outside,
      ...restField
    } = mergeField;
    // 是否有子节点
    const haveProperties = isObject(properties) || properties instanceof Array;
    // 当前节点是否为只读
    const isReadOnly = restField?.readOnly === true;
    const footerInstance = formRenderStore.componentInstance(footer, commonParams);
    const suffixInstance = formRenderStore.componentInstance(suffix, commonParams);
    const fieldProps = Object.assign({
      name: name,
      footer: footerInstance,
      suffix: suffixInstance,
      component: component !== undefined ? formRenderStore.componentParse(component) : undefined,
    }, restField);
    // 只读显示组件
    const readOnlyWidget = formRenderStore.componentInstance(readOnlyRender, commonParams);
    if (isReadOnly) {
      return haveProperties ?
        readOnlyWidget
        :
        <Form.Item {...fieldProps}>
          {readOnlyWidget}
        </Form.Item>
    };
    // 当前节点组件
    const FormNodeWidget = formRenderStore.componentInstance(typeRender || { type, props }, commonParams);
    // 节点的子组件
    const FormNodeChildren = renderChildren(properties, inside, commonParams)
    let result;
    if (haveProperties) {
      // 不携带表单域的节点
      result = React.isValidElement(FormNodeWidget) ? React.cloneElement(FormNodeWidget, { children: FormNodeChildren } as Partial<unknown>) : FormNodeChildren
    } else {
      // 携带表单域的节点
      result = (
        <Form.Item {...fieldProps} onValuesChange={valuesCallback}>
          {FormNodeWidget}
        </Form.Item>
      );
    }
    return withSide(result, outside, renderItem, commonParams)
  }

  // 渲染children
  const renderChildren = (properties: FormNodeProps['properties'], inside: CustomUnionType | undefined, current: GeneratePrams): any => {
    const { name, path, field } = current || {};
    const childs = Object.entries(properties || {})?.map(([key, childField], index: number) => {
      if (typeof key === 'string' || typeof key === 'number') {
        const joinPath = joinFormPath(path, key);
        const generateField = getEvalFieldProps(childField, joinPath);
        const joinName = generateField?.ignore === true ? name : joinFormPath(name, key);
        if (generateField) {
          generateField['index'] = index;
          return generateChild(joinName, joinPath, generateField, { name, path, field });
        }
      }
    });
    return withSide(childs, inside, renderList, current)
  }

  return renderChildren(properties, inside, { formrender: formRenderStore, form: formStore });
}

RenderFormChildren.displayName = 'Form.Children';
