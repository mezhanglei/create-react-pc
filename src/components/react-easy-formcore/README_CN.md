# react-easy-formcore

[English](./README.md) | 中文说明

[![Version](https://img.shields.io/badge/version-0.0.4-green)](https://www.npmjs.com/package/react-easy-formcore)

# 适用场景

轻量级表单表单容器组件，目标控件只需要提供`value`(或通过`valueProp`设置)和`onChange`方法，其余的交给组件中的`FormStore`来管理数据的更新与绑定。使用非常简单

# features

- [x] Form.Item组件不提供样式，只提供`value`(或通过`valueProp`设置)和`onChange`双向绑定。
- [x] Form.Field组件提供校验等表单控件外围容器的样式，以及`value`(或通过`valueProp`设置)和`onChange`双向绑定。
- [x] 使用的控件也可以自定义`onChange`，但只能通过`store.setFieldValue`等实例方法设置表单值
- [x] Form.Field和 Form.Field提供表单校验规则属性`rules`，可以自定义表单校验规则。

## 安装

```bash
npm install react-easy-formcore --save
# 或者
yarn add react-easy-formcore
```

## 基本使用

```javascript
import React from 'react';
import { Form, FormStore } from "react-easy-formcore";
import { Input, Select } from 'antd'

class demo extends React.Component {
    constructor(props) {
        super(props);
        this.store = new FormStore({Name1: '初始值设置'});
        this.state = {
        }
    }

    onSubmit = async (e) => {
        const { error, values } = await this.store.validate()
        console.log(error, values, 'error ang values')
    };

    render() {
        return (
            <Form store={this.store} onSubmit={this.onSubmit}>
                <Form.Field label="Name1" name="name1" rules={[{ required: true, message: 'Name1不能为空' }]}>
                  <Input />
                </Form.Field>
                <Form.Field label="Name2" name="name2" rules={[{ required: true, message: 'Name2不能为空' }]}>
                   <Input />
                </Form.Field>
                <Form.Field label="">
                    <button>Submit</button>
                </Form.Field>
            </Form>
        );
    }
}

```
## 自定义校验

```javascript
import React from 'react';
import { Form, FormStore } from "react-easy-formcore";
import { Input, Select } from 'antd'

class demo extends React.Component {
    constructor(props) {
        super(props);
        this.store = new FormStore({Name1: '初始值设置'});
        this.state = {
        }
    }

    onSubmit = async (e) => {
        const { error, values } = await this.store.validate()
        console.log(error, values, 'error ang values')
    };

    // 使用rule里的message字段校验提示
    // validator = (value) => {
    //   if(!value) {
    //     return false
    //   }
    //   return true;
    // }

    // 忽略message，通过callError方法自定义校验提示
    validator = (value, callError) => {
      if(value?.length > 5) {
        callError('Name1字段长度超过了5')
      }
      callError()
    }

    render() {
        return (
            <Form store={this.store} onSubmit={this.onSubmit}>
                <Form.Field label="Name1" name="name1" rules={[{ required: true, message: 'Name1不能为空' }, { validator: this.validator, message: '自定义校验固定提示' }]}>
                  <Input />
                </Form.Field>
                <Form.Field label="Name2" name="name2" rules={[{ required: true, message: 'Name2不能为空' }]}>
                   <Input />
                </Form.Field>
                <Form.Field label="">
                    <button>Submit</button>
                </Form.Field>
            </Form>
        );
    }
}

```

## APIs

### Form Props

- `className` 表单元素类名，`可选`。
- `store` 表单数据存储，`必须`。
- `inline` 所有Form.Field组件设置行内布局，默认值为`false`。
- `compact` 所有Form.Field组件是否隐藏错误信息，默认值为`false`。
- `required` 所有Form.Field组件是否显示星号，不包含表单校验，仅用于显示，默认值为`false`。
- `labelWidth` 所有Form.Field组件自定义标签宽度，`可选`。
- `gutter` 所有Form.Field组件自定义标签和表单组件间的距离，`可选`。
- `errorClassName` 所有Form.Field组件当有错误信息时，添加一个自定义类名，`可选`。
- `onSubmit` 表单提交回调，`可选`。
- `onReset` 表单重置默认值，`可选`。
- `onFormChange` 表单onChange变化时的事件函数，只会被控件主动`onChange`触发，不会被`store.setFieldValue`和`store.setFieldsValue`触发, 避免循环调用。`可选`。

### Form Field Props

- `className` 表单域类名，`可选`。
- `label` 表单域标签，`可选`。
- `name` 表单域字段名，`可选`。
- `valueProp` 填写到子组件的值属性名，默认值为`'value'`。
- `valueGetter` 从表单事件中获取表单值的方式，`可选`。
- `suffix` 后缀节点，`可选`。
- `rules` 表单域的校验规则 `可选`。

### Form Item Props
- `name` 表单域字段名，`可选`。
- `valueProp` 填写到子组件的值属性名，默认值为`'value'`。
- `valueGetter` 从表单事件中获取表单值的方式，`可选`。
- `suffix` 后缀节点，`可选`。
- `rules` 表单域的校验规则 `可选`。

### FormStore Methods

- `new FormStore(defaultValues?, rules?: FormRule[])` 创建表单存储。
- `store.getFieldValue()` 返回整个表单的值。
- `store.getFieldValue(name: string | string[])` 根据字段名返回表单域的值。当name为数组时，返回多个表单域的值
- `store.setFieldValue(name, value)` 更新表单域的值
- `store.setFieldsValue(obj: Partial<T>)` 设置表单域的值(覆盖)。
- `store.reset()` 重置表单。
- `store.validate()` 校验整个表单，并返回错误信息和表单值。
- `store.validate(name)` 根据字段名校验表单域的值，并返回错误信息和表单值。
- `store.getFieldError(name?: string)` 返回单个表单域的错误信息或表单所有的错误信息。
- `store.setFieldError(name: string, message: string | undefined)` 更新表单域的错误信息
- `store.setFieldsError(erros: FormErrors<T>)` 设置表单域的错误信息(覆盖)。
- `store.setFieldRules(name: string, rules?: FormRule[])` 更新表单域的校验规则。
- `store.setFieldsRules(values: FormRules<T>)` 设置表单域的校验规则(覆盖)。
- `store.subscribeValue(name: string, onChange: () => void)` 订阅表单项值的变动，并返回一个用于取消订阅的函数。
- `store.subscribeError(name: string, onChange: () => void)` 订阅表单项错误的变动，并返回一个用于取消订阅的函数。

### Hooks

- `useFormStore(defaultValues?, rules?: FormRule[])` 使用 hooks 创建 FormStore。
- `useFieldChange(props: FieldChangeProps)` 使用 hooks 创建表单域监听。
