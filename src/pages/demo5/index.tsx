import React, { Component, useState, useEffect, useRef, useCallback } from 'react';
import "./index.less";
import { Form, FormStore } from "@/components/react-form";
import { Input, Select } from 'antd'

class demo5 extends React.Component {
    constructor(props) {
        super(props);
        this.store = new FormStore();
        this.state = {
            list: [{ value: 'sss', key: 1 }, { value: 'aaaa', key: 2 }]
        }
    }

    componentDidMount() {

    }

    onSubmit = async (e) => {
        const result = await this.store.validate()
        console.log(result, 222)
    };

    onReset = () => {
        console.log(this.store.getFieldValue(), '重置')
    }

    validator = (value, callBack) => {
        if(value?.length < 2) {
            return false
        }
        return true;
    }

    render() {
        return (
            <Form store={this.store} onSubmit={this.onSubmit} onReset={this.onReset}>
                <Form.Field label="Name1" name="name1" rules={[{ required: true }, { validator: this.validator, message: '自定义校验' }]}>
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
                                )
                            })
                        }
                    </Select>
                </Form.Field>
                <Form.Field label="Name2" name="name2" rules={[{ required: true, message: '不能为空2' }]}>
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
                                )
                            })
                        }
                    </Select>
                </Form.Field>
                <Form.Field label="">
                    <button>Submit</button>
                </Form.Field>
            </Form>
        );
    }
}

export default demo5;