import React from 'react';
import { Form } from "@/components/react-easy-formcore";
import { FormFieldProps, RenderFormProps, SchemaData } from './types';
import { ComponentsMap } from './register';


class RenderFrom extends React.Component<RenderFormProps, {}> {
    constructor(props: RenderFormProps) {
        super(props);
        this.state = {
        };
        this.getFormList = this.getFormList.bind(this);
        this.generateTree = this.generateTree.bind(this);
    }

    // 生成组件树
    generateTree(name: string, field: FormFieldProps) {
        const { decorator = 'Form.Item', properties, component, props, ...rest } = field;
        const FormComponent = ComponentsMap?.[component];
        if (decorator === 'Form.Item') {
            return (
                <Form.Item {...rest} key={name} name={name} >
                    {FormComponent ? <FormComponent {...props} /> : null}
                    {Object.entries(properties || {})?.map(
                        ([name, formField]) => {
                            return this.generateTree(name, formField);
                        }
                    )}
                </Form.Item>
            );
        } else if (decorator === 'Form.List') {
            return (
                <Form.List {...rest} key={name} name={name} >
                    {FormComponent ? <FormComponent {...props} /> : null}
                    {Object.entries(properties || {})?.map(
                        ([name, formField]) => {
                            return this.generateTree(name, formField);
                        }
                    )}
                </Form.List>
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
        const { properties, ...restForm } = schema;
        return (
            <Form {...rest} {...restForm}>
                {this.getFormList(properties)}
            </Form>
        );
    }
}

export default RenderFrom;
