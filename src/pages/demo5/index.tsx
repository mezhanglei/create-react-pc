import React, { Component, useState, useEffect, useRef, useCallback } from 'react';
import "./index.less";
import { Form, FormStore } from "@/components/react-easy-formcore";
import { Input, Select } from 'antd';

class demo5 extends React.Component {
    store: FormStore<any>;
    constructor(props) {
        super(props);
        this.store = new FormStore();
        this.state = {
            list: [{ value: 'sss', key: 1 }, { value: 'aaaa', key: 2 }]
        };
    }

    componentDidMount() {
    }

    onSubmit = async (e) => {
        e?.preventDefault?.();
        const result = await this.store.validate();
        console.log(result, '表单结果');
    };

    validator = (value, callError) => {
        if (value?.length < 2) {
            callError('主动报错');
        }
        callError();
    }

    onChange = (value) => {
        // this.store.setFieldValue('name1', []);
    }

    onClick = () => {
    }

    onFormChange = ({ value }) => {

    }

    render() {
        return (
            <div>
                <Form store={this.store} onFormChange={this.onFormChange} onSubmit={this.onSubmit}>
                    <Form.Item label="表单容器" name="a">
                        <Form.List name="list">
                            <Form.Item
                                label="list's one"
                                rules={[
                                    { required: true, message: "Name1不能为空" },
                                    { validator: this.validator, message: "自定义校验固定提示" },
                                ]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                label="list's two"
                                rules={[{ required: true, message: "Name2不能为空" }]}
                            >
                                <Input />
                            </Form.Item>
                        </Form.List>
                        <Form.List name="b">
                            <Form.Item key="name1" rules={[{ required: true, message: "不能为空1" }, { validator: this.validator, message: '自定义校验' }]}>
                                <Select
                                    mode="multiple"
                                    allowClear
                                    style={{ width: '100%' }}
                                    placeholder="Please select"
                                    labelInValue
                                    onChange={this.onChange}
                                >
                                    {
                                        this.state.list?.map((item) => {
                                            return (
                                                <Select.Option key={item.key}>
                                                    {item.value}
                                                </Select.Option>
                                            );
                                        })
                                    }
                                </Select>
                            </Form.Item>
                            <Form.Item key="name2" rules={[{ required: true, message: '不能为空2' }]}>
                                <Select
                                    mode="multiple"
                                    allowClear
                                    style={{ width: '100%' }}
                                    placeholder="Please select"
                                    labelInValue
                                >
                                    {
                                        this.state.list?.map((item) => {
                                            return (
                                                <Select.Option key={item.key}>
                                                    {item.value}
                                                </Select.Option>
                                            );
                                        })
                                    }
                                </Select>
                            </Form.Item>
                            <Form.Item>
                                <button onClick={this.onClick}>Submit</button>
                            </Form.Item>
                        </Form.List>
                    </Form.Item>
                </Form>
            </div>
        );
    }
}

export default demo5;
