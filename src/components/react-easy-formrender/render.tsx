import React from 'react';
import { Form } from "@/components/react-easy-formcore";
import { ChildrenComponent, FormFieldProps, RenderFormProps, RenderFormState, SchemaData } from './types';
import { defaultFields } from './register';
import { isObjectEqual } from '@/utils/object';
import { AopFactory } from '@/utils/function-aop';
import { isEmpty, isObject } from '@/utils/type';

class RenderFrom extends React.Component<RenderFormProps, RenderFormState> {
    aopFormOnChange: AopFactory;
    aopFormMount: AopFactory;
    constructor(props: RenderFormProps) {
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
        this.onFormChange = this.onFormChange.bind(this);
        this.onFormMount = this.onFormMount.bind(this);
        this.handleFieldProps = this.handleFieldProps.bind(this);
        this.calcExpression = this.calcExpression.bind(this);
        this.showCalcFieldProps = this.showCalcFieldProps.bind(this);
        this.handleWatch = this.handleWatch.bind(this);
        this.aopFormOnChange = new AopFactory(this.onFormChange);
        this.aopFormMount = new AopFactory(this.onFormMount);
    }

    static defaultProps = {
        widgets: {},
        Fields: defaultFields
    }

    // 表单渲染完成
    onFormMount() {
        this.handleFieldProps();
        this.handleWatch();
    }

    componentDidUpdate(prevProps: RenderFormProps, prevState: RenderFormState) {
        const schemaChanged = !isObjectEqual(this.props.schema, prevProps.schema);
        if (schemaChanged) {
            this.handleFieldProps();
        }
    }

    static getDerivedStateFromProps(nextProps: RenderFormProps, prevState: RenderFormState) {
        const schemaChanged = !isObjectEqual(nextProps.schema, prevState.prevSchema);
        if (schemaChanged) {
            return {
                ...prevState,
                prevSchema: nextProps.schema
            };
        }
        return null;
    }

    // 初始化监听方法
    handleWatch(isMounted?: boolean) {
        const { store, watch } = this.props;
        Object.entries(watch)?.map(([key, callback]) => {
            if (typeof callback === 'function') {
                store?.subscribeValue(key, (key) => callback(key))
            } else {

            }
        });
    }

    // 初始化所有的控件的属性
    handleFieldProps() {
        const fieldPropsMap = new Map();
        // 遍历对象树中的叶子节点(控件的属性节点)
        const deepFindProps = (data: object, parentPath?: string) => {
            for (const key in data) {
                const target = data[key];
                if (isObject(target)) {
                    const keys = Object.keys(target);
                    for (let i = 0; i < keys?.length; i++) {
                        const childKey = keys[i];
                        const value = target[childKey];
                        // 目标为叶子节点时(控件的属性节点), 兼容字符串表达式
                        if (childKey !== 'properties') {
                            const currentKey = `${key}.${childKey}`;
                            const path = parentPath ? `${parentPath}.${currentKey}` : currentKey;
                            const result = this.calcExpression(value);
                            fieldPropsMap.set(path, result)
                        }
                    }
                } else if (!isEmpty(target)) {
                    const path = parentPath ? `${parentPath}.${key}` : key;
                    const result = this.calcExpression(target);
                    fieldPropsMap.set(path, result)
                }
                // 具有properties则深入遍历properties
                const properties = target?.properties;
                if (typeof properties === 'object') {
                    const path = parentPath ? `${parentPath}.${key}` : key;
                    deepFindProps(properties, path)
                }
            }
        };
        deepFindProps(this.props.schema?.properties);
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

    // onChange时触发的事件
    onFormChange(params: { name: string, value: any }) {
        this.handleFieldProps();
    }

    // 值兼容字符串表达式
    calcExpression(target?: string | boolean) {
        if (typeof target === 'string') {
            const reg = new RegExp('\{\{\s*.*?\s*\}\}', 'gi');
            const hiddenStr = target?.match(reg)?.[0];
            if (hiddenStr) {
                let target = hiddenStr?.replace(/\{\{|\}\}|\s*/g, '');
                target = target?.replace(/\$form/g, 'this?.props?.store?.getFieldValue()');
                target = target?.replace(/\$schema/g, 'this?.props?.schema');
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
    getFormList(properties: SchemaData['properties']) {
        return Object.entries(properties || {}).map(
            ([name, formField]) => {
                return this.generateTree({ name: name, field: formField });
            }
        );
    }

    render() {
        const { schema, watch, ...rest } = this.props;
        const { properties, ...restForm } = schema || {};
        const formChangeProps = rest?.onFormChange || restForm?.onFormChange;
        const formMountProps = rest?.onMount || restForm?.onMount;
        const formChange = this.aopFormOnChange.addAfter(formChangeProps);
        const formOnMount = this.aopFormMount.addAfter(formMountProps);

        return (
            <Form  {...restForm} {...rest} onFormChange={formChange} onMount={formOnMount}>
                {this.getFormList(properties)}
            </Form>
        );
    }
}

export default RenderFrom;
