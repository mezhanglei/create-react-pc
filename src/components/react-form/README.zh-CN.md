# `react-hero-form`

> 一个功能齐全的表单组件。

## 安装

```bash
npm install react-hero-form --save
# 或者
yarn add react-hero-form
```

## 基础用法

只需简单地创建一个`FormStore`实例并传递到`Form`组件上。对于表单组件（如`input`），无需再传递`value`和`onChange`了。

```javascript
import { Form, FormStore } from "react-hero-form";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.store = new FormStore();
  }

  onSubmit = e => {
    e.preventDefault();

    const values = this.store.getFieldValue();
    console.log(values);
  };

  render() {
    return (
      <Form store={this.store}>
        <Form.Field label="Name" name="name">
          <input type="text" />
        </Form.Field>
        <Form.Field label="">
          <button onClick={this.onSubmit}>Submit</button>
        </Form.Field>
      </Form>
    );
  }
}
```

## 默认值

如要设置默认值，只需提供一个对象给第一个参数。并且你可以在任何时候通过`reset()`恢复到这个默认值。

```javascript
const store = new FormStore({ name: "Harry" });
// ...
store.reset();
```

## 表单校验


```javascript

import React from 'react';
import { Form, FormStore } from "react-form";
import { Input, Select } from 'antd'

class demo extends React.Component {
    constructor(props) {
        super(props);
        this.store = new FormStore();
        this.state = {
        }
    }

    onSubmit = async (e) => {
        const { error, values } = await this.store.validate()
        console.log(error, values, '当前报错以及表单所有控件的值')
    };

    render() {
        return (
            <Form store={this.store} onSubmit={this.onSubmit}>
                <Form.Field label="Name1" name="name1" rules={[{ required: true, message: '不能为空1' }]}>
                  <Input />
                </Form.Field>
                <Form.Field label="Name2" name="name2" rules={[{ required: true, message: '不能为空2' }]}>
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
- `inline` 设置行内布局，默认值为`false`。
- `compact` 是否隐藏错误信息，默认值为`false`。
- `required` 是否显示星号，不包含表单校验，仅用于显示，默认值为`false`。
- `labelWidth` 自定义标签宽度，`可选`。
- `gutter` 自定义标签和表单组件间的距离，`可选`。
- `errorClassName` 当有错误信息时，添加一个自定义类名，`可选`。
- `onSubmit` 表单提交回调，`可选`。

### Form Field Props

- `className` 表单域类名，`可选`。
- `label` 表单域标签，`可选`。
- `name` 表单域字段名，`可选`。
- `valueProp` 填写到子组件的值属性名，默认值为`'value'`。
- `valueGetter` 从表单事件中获取表单值的方式，`可选`。
- `suffix` 后缀节点，`可选`。

### FormStore Methods

- `new FormStore(defaultValues?, rules?: FormRule[])` 创建表单存储。
- `store.getFieldValue()` 返回整个表单的值。
- `store.getFieldValue(name: string | string[])` 根据字段名返回表单域的值。当name为数组时，返回多个表单域的值
- `store.setFieldValue(name, value)` 更新表单域的值
- `store.setFieldsValue(obj: Partial<T>)` 设置表单域的值
- `store.reset()` 重置表单。
- `store.validate()` 校验整个表单，并返回错误信息和表单值。
- `store.validate(name)` 根据字段名校验表单域的值，并返回错误信息和表单值。
- `store.getFieldError(name?: string)` 返回单个表单域的错误信息或表单所有的错误信息。
- `store.setFieldError(name: string, message: string | undefined)` 更新表单域的错误信息
- `store.setFieldsError(erros: FormErrors<T>)` 设置表单域的错误信息。
- `store.setFieldRules(name: string, rules?: FormRule[])` 更新表单域的校验规则。
- `store.setFieldsRules(values: FormRules<T>)` 设置表单域的校验规则。
- `store.subscribe(name: string, onChange: () => void)` 订阅表单变动，并返回一个用于取消订阅的函数。

### Hooks

- `useFormStore(defaultValues?, rules?: FormRule[])` 使用 hooks 创建 FormStore。
- `useFieldChange(props: FieldChangeProps)` 使用 hooks 创建表单域监听。
