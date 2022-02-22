import React from 'react';
import { ChildrenComponent, FormFieldProps, RenderFormProviderProps, RenderFormProviderState, SchemaData } from './types';
import { defaultFields } from './register';
import { isObjectEqual } from '@/utils/object';
import { AopFactory } from '@/utils/function-aop';
import { isEmpty } from '@/utils/type';
import { debounce } from '@/utils/common';
import { FormStoreContext } from '../react-easy-formcore/form-store-context';
import { FormOptionsContext } from '../react-easy-formcore/form-options-context';

export default class RenderFormProvider extends React.Component<RenderFormProviderProps, RenderFormProviderState> {
  aopOnValuesChange: AopFactory;
  constructor(props: RenderFormProviderProps) {
    super(props);
    this.state = {
      fieldPropsMap: new Map()
    };
    this.getFormList = this.getFormList.bind(this);
    this.generateTree = this.generateTree.bind(this);
    this.generateChildren = this.generateChildren.bind(this);
    this.renderFormItem = this.renderFormItem.bind(this);
    this.renderListItem = this.renderListItem.bind(this);
    this.renderProperties = this.renderProperties.bind(this);
    this.onValuesChange = debounce(this.onValuesChange.bind(this), 16.7);
    this.handleFieldProps = this.handleFieldProps.bind(this);
    this.calcExpression = this.calcExpression.bind(this);
    this.showCalcFieldProps = this.showCalcFieldProps.bind(this);
    this.initWatch = this.initWatch.bind(this);
    this.aopOnValuesChange = new AopFactory(this.onValuesChange);
  }

  static defaultProps = {
    widgets: {},
    Fields: defaultFields
  }

  // 表单渲染完成
  componentDidMount() {
    this.handleFieldProps();
    this.initWatch();
  }

  componentWillUnmount() {
    const { store } = this.props;
    store?.removeListenStoreValue();
  }

  // 监听表单值变化的事件(防抖执行)
  onValuesChange() {
    this.handleFieldProps();
  }

  componentDidUpdate(prevProps: RenderFormProviderProps, prevState: RenderFormProviderState) {
    const propertiesChanged = !isObjectEqual(this.props.properties, prevProps.properties);
    if (propertiesChanged) {
      this.handleFieldProps();
    }
  }

  static getDerivedStateFromProps(nextProps: RenderFormProviderProps, prevState: RenderFormProviderState) {
    const propertiesChanged = !isObjectEqual(nextProps.properties, prevState.prevProperties);
    if (propertiesChanged) {
      return {
        ...prevState,
        prevProperties: nextProps.properties
      };
    }
    return null;
  }

  // 初始化监听
  initWatch() {
    const { store, watch } = this.props;
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
  handleFieldProps() {
    const fieldPropsMap = new Map();
    // 遍历处理对象树中的非properties字段
    const deepHandle = (formField: FormFieldProps, parent: string) => {
      for (const key in formField) {
        const value = formField[key];
        if (key !== 'properties') {
          const path = parent ? `${parent}.${key}` : key;
          const result = this.calcExpression(value);
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
    }
    const properties = this.props?.properties;
    for (const key in properties) {
      const formField = properties[key];
      deepHandle(formField, key);
    }
    this.setState({ fieldPropsMap: fieldPropsMap });
  }

  // 展示计算完表达式之后的结果
  showCalcFieldProps(field?: object, path?: string) {
    const { fieldPropsMap } = this.state;
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
  calcExpression(target?: string | boolean) {
    if (typeof target === 'string') {
      const reg = new RegExp('\{\{\s*.*?\s*\}\}', 'gi');
      const hiddenStr = target?.match(reg)?.[0];
      if (hiddenStr) {
        let target = hiddenStr?.replace(/\{\{|\}\}|\s*/g, '');
        target = target?.replace(/\$form/g, 'this.props.store && this.props.store.getFieldValue()');
        const actionStr = "return " + target;
        const action = new Function(actionStr);
        const value = action.apply(this);
        return value;
      } else {
        return target;
      }
    } else {
      return target;
    }
  }

  // 生成组件的children
  generateChildren(children?: ChildrenComponent['props']['children']) {
    const { widgets } = this.props;
    if (children instanceof Array) {
      return children?.map(({ component, props }) => {
        const Child = widgets?.[component];
        return <Child {...props} children={this.generateChildren(props?.children)} />;
      });
    } else {
      return children;
    }
  }

  // 生成最小单元
  renderFormItem(params: { name: string, itemField: FormFieldProps, path?: string }) {
    const { name, itemField, path } = params || {};
    const { widgets, Fields } = this.props;
    const { component, props, ...fieldProps } = itemField;
    const { children, ...componentProps } = props || {};
    const FormField = Fields?.['Form.Item'];
    const FormComponent = component && widgets?.[component];
    const newField = this.showCalcFieldProps(fieldProps, path);
    return (
      <FormField {...fieldProps} {...newField} key={name} name={name}>
        <FormComponent {...componentProps}>{this.generateChildren(children)}</FormComponent>
      </FormField>
    );
  }

  // 自定义render
  renderListItem(params: { name: string, itemField: FormFieldProps, path?: string }) {
    const { name, itemField, path } = params || {};
    const { Fields } = this.props;
    const FormField = Fields?.['List.Item'];
    const { render, ...fieldProps } = itemField;
    const newField = this.showCalcFieldProps(itemField, path);

    return (
      <FormField {...fieldProps} {...newField} key={name}>
        {render}
      </FormField>
    )
  }

  // 生成properties
  renderProperties(params: { name: string, propertiesField: FormFieldProps, path?: string }) {
    const { name, propertiesField, path } = params || {};
    const { Fields } = this.props;
    const { properties, component, props, render, ...fieldProps } = propertiesField;
    let FormField;
    if (properties instanceof Array) {
      FormField = Fields['Form.List']
    } else {
      FormField = Fields['Form.Item']
    }
    const newField = this.showCalcFieldProps(fieldProps, path);

    return (
      <FormField {...fieldProps} {...newField} key={name} name={name}>
        {
          properties instanceof Array ?
            properties?.map((formField, index) => {
              return this.generateTree({ name: `${index}`, field: formField, path: path });
            })
            :
            Object.entries(properties || {})?.map(
              ([name, formField]) => {
                return this.generateTree({ name: name, field: formField, path: path });
              }
            )
        }
      </FormField>
    );
  }

  // 生成组件树
  generateTree(params: { name: string, field: FormFieldProps, path?: string }) {
    const { name, field, path } = params || {};
    const { hidden, readOnly, ...propertiesField } = field;
    const { properties, ...itemField } = propertiesField || {};
    const currentPath = path ? `${path}.${name}` : name;

    // 是否隐藏
    const { fieldPropsMap } = this.state;
    const hiddenResult = fieldPropsMap.get(`${currentPath}.hidden`);
    if (hiddenResult) return;
    // 是否只读
    if (readOnly === true) {
      return this.renderListItem({ name: name, itemField: itemField, path: currentPath });
    }

    if (typeof properties === 'object') {
      return !isEmpty(properties) && this.renderProperties({ name: name, propertiesField: propertiesField, path: currentPath })
    } else {
      return this.renderFormItem({ name: name, itemField: itemField, path: currentPath });
    }
  };

  // 渲染
  getFormList(properties: SchemaData['properties'], renderItem: (params: { name: string, field: FormFieldProps, path?: string }) => any) {
    return Object.entries(properties || {}).map(
      ([name, formField]) => {
        return renderItem({ name: name, field: formField });
      }
    );
  }

  render() {
    const { properties, children, store, onValuesChange, ...rest } = this.props;
    const valuesCallback = this.aopOnValuesChange.addAfter(onValuesChange);

    const options = {
      ...rest,
      onValuesChange: valuesCallback
    }

    return (
      <FormStoreContext.Provider value={store}>
        <FormOptionsContext.Provider value={options}>
          {
            typeof children === 'function'
              ?
              children(properties, this.generateTree)
              :
              this.getFormList(properties, this.generateTree)
          }
        </FormOptionsContext.Provider>
      </FormStoreContext.Provider>
    );
  }
}
