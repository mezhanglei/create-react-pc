import React, { useContext, useEffect, useMemo, useState } from 'react';
import { FormFieldProps, RenderFormChildrenProps, GeneratePrams, FieldUnionType, PropertiesData, GenerateFieldProps } from './types';
import { defaultComponents } from './components';
import { Form, FormOptionsContext, FormRule, FormStore, FormStoreContext, ItemCoreProps, joinFormPath } from '../react-easy-formcore';
import { useFormRenderStore } from './use-formrender';
import { isEqual } from '@/utils/object';
import { matchExpression } from './utils/utils';
import { isEmpty } from '@/utils/type';

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
    properties: propsProperties,
    store,
    expressionImports = {}
  } = props;

  const form = useContext<FormStore>(FormStoreContext);
  const formRenderStore = store || useFormRenderStore();
  formRenderStore.registry('components', { ...defaultComponents, ...components });
  formRenderStore.registry('controls', controls);

  const {
    onValuesChange
  } = options;

  const valuesCallback: ItemCoreProps['onValuesChange'] = (...args) => {
    onValuesChange && onValuesChange(...args)
    handleFieldProps();
  }

  // 从formRenderStore中订阅更新properties
  useEffect(() => {
    if (!formRenderStore) return
    const uninstall = formRenderStore.subscribeProperties((newValue, oldValue) => {
      setProperties(newValue);
      if (!isEqual(newValue, oldValue)) {
        onPropertiesChange && onPropertiesChange(newValue, oldValue)
      }
    })
    return uninstall;
  }, [formRenderStore, onPropertiesChange]);

  useEffect(() => {
    return () => {
      form?.unsubscribeFormGlobal();
    }
  }, []);

  // 从props中更新properties
  useEffect(() => {
    if (!formRenderStore) return;
    formRenderStore.setProperties(propsProperties);
  }, [propsProperties]);

  // 订阅监听函数
  useMemo(() => {
    if (!form || !watch) return;
    return Object.entries(watch)?.map(([key, watcher]) => {
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
  }, [form, watch]);

  // 变化时更新
  useEffect(() => {
    if (!properties) return;
    handleFieldProps();
  }, [properties]);

  // 遍历处理rules字段
  const evalRules = (rules: FormRule[]) => {
    if (!(rules instanceof Array)) return;
    const newRules = rules?.map((rule) => {
      const newRule = {};
      if (rule) {
        for (let key of Object.keys(rule)) {
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
      for (let key of Object.keys(val)) {
        const propsItem = val?.[key];
        const generateItem = evalExpression(propsItem, uneval);
        newProps[key] = generateItem;
      }
      return newProps;
    }
  }

  // 递归遍历处理表单域的字符串表达式并存储解析后的信息
  const handleFieldProps = () => {
    if (typeof properties !== 'object') return;
    const fieldPropsMap = {};
    // 遍历处理对象树中的非properties字段
    const deepHandle = (formField: FormFieldProps, path: string) => {
      for (const propsKey of Object.keys(formField || {})) {
        if (typeof propsKey === 'string') {
          if (propsKey !== 'properties') {
            const propsValue = formField[propsKey];
            let result = propsValue;
            const matchStr = matchExpression(propsValue);
            if (matchStr) {
              result = evalExpression(propsValue, uneval);
            } else if (propsKey === 'props') {
              result = evalProps(propsValue);
            } else if (propsKey === 'rules') {
              result = evalRules(propsValue);
            }
            const formPath = joinFormPath(path, propsKey);
            fieldPropsMap[formPath] = result;
          } else {
            const childProperties = formField[propsKey];
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

  // 遍历对象获取
  const getValueFromObject = (val?: Partial<FormFieldProps>, generateVal?: Partial<GenerateFieldProps>) => {
    return Object.fromEntries(
      Object.entries(val || {})?.map(
        ([propsKey]) => {
          const propsItem = val?.[propsKey];
          const matchStr = matchExpression(propsItem);
          const generateItem = generateVal?.[propsKey];
          if (generateItem !== undefined) {
            return [propsKey, generateItem]
          }
          if (matchStr) {
            return [propsKey]
          };
          return [propsKey, propsItem]
        }
      )
    );
  }

  // 获取计算表达式之后的结果
  const getEvalFieldProps = (field: FormFieldProps, path?: string) => {
    if (!path || isEmpty(field)) return;
    return Object.fromEntries(
      Object.entries(field || {})?.map(
        ([propsKey]) => {
          const formPath = joinFormPath(path, propsKey);
          const propsValue = field[propsKey];
          const generateValue = formPath && fieldPropsMap[formPath];
          const matchStr = matchExpression(propsValue);
          if (generateValue !== undefined) {
            return [propsKey, generateValue]
          }
          if (matchStr) {
            if (propsKey === 'valueSetter') {
              return [propsKey, () => undefined]
            }
            return [propsKey]
          };
          if (propsKey === 'props') {
            return [propsKey, getValueFromObject(propsValue, generateValue)]
          }
          return [propsKey, propsValue];
        }
      )
    );
  }

  // 值兼容字符串表达式
  const evalExpression = (value?: string | boolean, uneval?: boolean): any => {
    if (uneval) return value;
    if (typeof value === 'string') {
      const matchStr = matchExpression(value)
      if (matchStr) {
        const importsKeys = ['form', 'store', 'formvalues'].concat(Object.keys(expressionImports))
        const importsValues = Object.values(expressionImports);
        const target = matchStr?.replace(/\{\{|\}\}/g, '');
        target?.replace('$', 'g'); // 去掉$开头的，兼容前版本
        const actionStr = "return " + target;
        // 函数最后一个参数为函数体，前面均为传入的变量名
        const action = new Function(...importsKeys, actionStr);
        const result = action(form, formRenderStore, form && form.getFieldValue() || {}, ...importsValues);
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
  const withSide = (children: any, side?: FieldUnionType, render?: (params: GeneratePrams<any>) => any, commonProps?: GeneratePrams) => {
    const childs = render ? render?.({ ...commonProps, ...ignoreTag, children }) : children
    const childsWithSide = side ? formRenderStore.componentInstance(side, { ...commonProps, ...ignoreTag }, childs) : childs;
    return childsWithSide;
  }

  // 生成子元素
  const generateChild = (name: string | number, field: GenerateFieldProps, parent?: string, formparent?: string) => {
    if (field?.hidden === true) {
      return;
    }
    const { readOnly, readOnlyRender, hidden, props, type, typeRender, properties, footer, suffix, component, inside, outside, ...restField } = field;
    if (!field) return;

    const commonParams = { name, field: { ...options, ...field }, parent, formparent, form: form, store: formRenderStore }; // 公共参数
    const footerInstance = formRenderStore.componentInstance(footer, commonParams);
    const suffixInstance = formRenderStore.componentInstance(suffix, commonParams);
    const fieldParse = component !== undefined ? formRenderStore.componentParse(component) : undefined;
    // 表单域的传参
    const fieldProps = {
      key: name,
      name: name,
      onValuesChange: valuesCallback,
      footer: footerInstance,
      suffix: suffixInstance,
      component: fieldParse,
      ignore: readOnly,
      ...restField
    }
    // 表单域组件
    const FormField = properties instanceof Array ? Form.List : Form.Item;
    // 控件元素
    const formItemChild = formRenderStore.controlInstance(typeRender || { type, props }, commonParams)
    // 只读显示
    const readOnlyChild = formRenderStore.controlInstance(readOnlyRender, commonParams)
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
    const currentPath = joinFormPath(parent, name);
    const formPath = joinFormPath(formparent, field?.ignore ? undefined : name);
    const childs = Object.entries(properties || {})?.map(([key, formField], index: number) => {
      const childName = key;
      if (typeof childName === 'string' || typeof childName === 'number') {
        const childPath = joinFormPath(currentPath, childName);
        const childField = getEvalFieldProps(formField, childPath);
        if (childField) {
          childField['index'] = index;
          return generateChild(childName, childField, currentPath, formPath);
        }
      }
    });
    return withSide(childs, inside, renderList, commonParams)
  }

  return renderChildrenList(properties, inside, { store: formRenderStore, form: form });
}

RenderFormChildren.displayName = 'Form.Children';
