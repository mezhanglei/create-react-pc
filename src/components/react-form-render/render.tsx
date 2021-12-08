import React from 'react';
import { Form } from "@/components/react-easy-formcore";
import { FormFieldProps, RenderFormProps, SchemaData } from './types';
import { ComponentsMap, FormFieldMap } from './register';


class RenderFrom extends React.Component<RenderFormProps, {}> {
    constructor(props: RenderFormProps) {
        super(props);
        this.state = {
        };
        this.getFormList = this.getFormList.bind(this);
        this.generateTree = this.generateTree.bind(this);
        this.generateChildren = this.generateChildren.bind(this);
    }

    // 生成组件的children
    generateChildren(children: any) {
        React.Children.map(children, (child: any, index) => {
            return React.cloneElement(child, { key: index });
        });
    }

    // 生成组件树
    generateTree(name: string, field: FormFieldProps) {
        const { decorator = 'Form.Item', properties, component, props, ...rest } = field;
        const FormComponent = ComponentsMap?.[component];
        const FormField = FormFieldMap?.[decorator];
        const { children, ...componentProps } = props || {};
        if (FormField) {
            return (
                <FormField {...rest} key={name} name={name} >
                    {FormComponent ? <FormComponent {...componentProps}>{this.generateChildren(children)}</FormComponent> : null}
                    {Object.entries(properties || {})?.map(
                        ([name, formField]) => {
                            return this.generateTree(name, formField);
                        }
                    )}
                </FormField>
            );
        }
    };

    // 渲染
    getFormList(properties: SchemaData['properties']) {
        return Object.entries(properties || {}).map(
            ([name, formField]) => {
                return this.generateTree(name, formField);
            }
        );
    }

    render() {
        const { schema, ...rest } = this.props;
        const { properties, ...restForm } = schema || {};
        return (
            <Form {...rest} {...restForm}>
                {this.getFormList(properties)}
            </Form>
        );
    }
}

export default RenderFrom;
