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

    onSubmit = e => {
        e.preventDefault();

        const values = this.store.get();
        console.log(values);
    };

    render() {
        return (
            <Form store={this.store}>
                <Form.Field label="Name1" name="name1.label">
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
                <Form.Field label="Name2" name="name2">
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
                    <button onClick={this.onSubmit}>Submit</button>
                </Form.Field>
            </Form>
        );
    }
}

export default demo5;