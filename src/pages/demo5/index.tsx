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
                <Form.Field label="Name" name="name1">
                    <Input />
                </Form.Field>
                <Form.Field label="">
                    <button onClick={this.onSubmit}>Submit</button>
                </Form.Field>
            </Form>
        );
    }
}

export default demo5;