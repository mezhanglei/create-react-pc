import React from 'react';
import { Form } from "@/components/react-easy-formcore";
import { ChildrenComponent, FormFieldProps, RenderFormProps, RenderFormState, SchemaData } from './types';
import { defaultFields } from './register';
import { isObjectEqual } from '@/utils/object';
import { deepGetKeys } from './utils';
import { AopFactory } from '@/utils/function-aop';

class RenderFrom extends React.Component<RenderFormProps, RenderFormState> {
    aopFormOnChange: AopFactory;
    aopFormMount: AopFactory;
    constructor(props: RenderFormProps) {
        super(props);
        this.state = {
            hiddenMap: {}
        };
        this.getFormList = this.getFormList.bind(this);
        this.generateTree = this.generateTree.bind(this);
        this.generateChildren = this.generateChildren.bind(this);
        this.renderFormItem = this.renderFormItem.bind(this);
        this.onFormChange = this.onFormChange.bind(this);
        this.onFormMount = this.onFormMount.bind(this);
        this.handleHidden = this.handleHidden.bind(this);
        this.isHidden = this.isHidden.bind(this);
        this.aopFormOnChange = new AopFactory(this.onFormChange);
        this.aopFormMount = new AopFactory(this.onFormMount);
    }

    static defaultProps = {
        widgets: {},
        Fields: defaultFields
    }

    // 表单渲染完成
    onFormMount() {
        this.handleHidden();
    }

    componentDidUpdate(prevProps: RenderFormProps, prevState: RenderFormState) {
        const schemaChanged = !isObjectEqual(this.props.schema, prevProps.schema);
        if (schemaChanged) {
            this.handleHidden();
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

    // 处理hidden数据
    handleHidden() {
        const list = deepGetKeys(this.props?.schema?.properties, 'hidden')
        let hiddenMap: RenderFormState['hiddenMap'] = {};
        for (let i = 0; i < list?.length; i++) {
            const item = list[i];
            if (item) {
                const schemaPath = item?.path;
                const path = schemaPath?.split('.properties.')?.join('.');
                const hidden = item?.value;
                hiddenMap[path] = this.isHidden(hidden);
            }
        }
        this.setState({
            hiddenMap: hiddenMap
        });
    }

    // onChange时触发的事件
    onFormChange(params: { name: string, value: any }) {
        this.handleHidden();
    }

    // 根据字段返回是否隐藏
    isHidden(hidden?: string | boolean) {
        if (typeof hidden === 'boolean') {
            return true;
        } else if (typeof hidden === 'string') {
            let target = hidden?.replace(/\{\{|\}\}|\s*/g, '');
            target = target?.replace(/\$form/g, 'this?.props?.store?.getFieldValue()')
            const actionStr = "return " + target;
            const action = new Function(actionStr);
            const isHidden = action.apply(this);
            return isHidden;
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
    renderFormItem(params: { name: string, field: FormFieldProps, path?: string }) {
        const { name, field } = params || {};
        const { widgets, Fields } = this.props;
        const { decorator = 'Form.Item', properties, component, props, ...rest } = field;
        const { children, ...componentProps } = props || {};
        const FormField = Fields?.[decorator];
        const FormComponent = widgets?.[component];
        return (
            <FormField {...rest} key={name} name={name} >
                <FormComponent {...componentProps}>{this.generateChildren(children)}</FormComponent>
            </FormField>
        );
    }

    // 生成组件树
    generateTree(params: { name: string, field: FormFieldProps, path?: string }) {
        const { name, field, path } = params || {};
        const { Fields } = this.props;
        const { decorator = 'Form.Item', properties, component, props, hidden, ...rest } = field;
        const FormField = Fields?.[decorator];
        const currentPath = path ? `${path}.${name}` : name;
        const { hiddenMap } = this.state;

        if (hiddenMap[currentPath]) return;

        if (typeof properties === 'object') {
            return (
                <FormField {...rest} key={name} name={name}>
                    {
                        properties instanceof Array ?
                            properties?.map((formField, index) => {
                                return this.generateTree({ name: `${index}`, field: formField, path: currentPath });
                            })
                            :
                            Object.entries(properties || {})?.map(
                                ([name, formField]) => {
                                    return this.generateTree({ name: name, field: formField, path: currentPath });
                                }
                            )
                    }
                </FormField>
            );
        } else {
            return this.renderFormItem(params)
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
        const { schema, ...rest } = this.props;
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
