# react-easy-formcore

[English](./README.md) | 中文说明

[![Version](https://img.shields.io/badge/version-0.3.8-green)](https://www.npmjs.com/package/react-easy-formcore)

# 适用场景

轻量级表单容器双向绑定组件，目标控件只需要提供`props`方法：`value`(或通过`valueProp`设置)和`onChange`，其余的交给组件中的`FormStore`来管理数据的更新与绑定。使用非常简单

# Matters
注意：在使用之前需要先引入css样式文件，例：`import 'react-easy-formcore/lib/css/main.css'`;

# Form.Item

表单中的组件最小单元，作为一个对象的节点可以相互嵌套。

- [x] 提供样式，以及`value`(或通过`valueProp`设置)和`onChange`双向绑定。
- [x] 可以控件外部自定义`onChange`，但只能通过`store.setFieldValue`等实例方法设置表单值
- [x] 可以提供表单校验规则属性`rules`，进行自定义表单校验规则。

# Form.List

`Form.Item`组件作为`Form.List`中的值，组合形成一个数组

- [x]  `Form.List`中的每一项为数组中的元素，无需设置`name`字段
- [x] `Form.List`提供的`rules`校验规则，对数组中的所有输入项都有效，但优先级低于数组中的项自己的`rules`规则

## 安装

```bash
npm install react-easy-formcore --save
# 或者
yarn add react-easy-formcore
```

## 基本使用

```javascript
import React from "react";
import { Form, FormStore } from "react-easy-formcore";
import 'react-easy-formcore/lib/css/main.css';
import { Input, Select } from "antd";

class demo extends React.Component {
  constructor(props) {
    super(props);
    this.store = new FormStore({ name1: "初始值设置" });
    this.state = {};
  }

  onSubmit = async (e) => {
    const { error, values } = await this.store.validate();
    console.log(error, values, "error ang values");
  };

  // 自定义校验
  // validator = (value) => {
  //   if(!value) {
  //     return false
  //   }
  //   return true;
  // }

  // 自定义校验
  validator = (value, callError) => {
    if (value?.length > 5) {
      callError("name1字段长度超过了5");
    }
    callError();
  };

  render() {
    return (
      <Form store={this.store} onSubmit={this.onSubmit}>
        <Form.Item
          label="Name1"
          name="name1"
          rules={[{ required: true, message: "name1不能为空" }, { validator: this.validator, message: "自定义校验固定提示" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Name2"
          name="name2"
          rules={[{ required: true, message: "name2不能为空" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item label="">
          <button>Submit</button>
        </Form.Item>
      </Form>
    );
  }
}
```

## 数组管理

```javascript
import React from "react";
import { Form, FormStore } from "react-easy-formcore";
import 'react-easy-formcore/lib/css/main.css';
import { Input, Select } from "antd";

class demo extends React.Component {
  constructor(props) {
    super(props);
    this.store = new FormStore({ name1: "初始值设置" });
    this.state = {};
  }

  onSubmit = async (e) => {
    const { error, values } = await this.store.validate();
    console.log(error, values, "error ang values");
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
    if (value?.length > 5) {
      callError("name1字段长度超过了5");
    }
    callError();
  };



  render() {
    return (
      <Form store={this.store} onSubmit={this.onSubmit}>
        <Form.List label="list" name="list">
          <Form.Item
            rules={[
              { required: true, message: "list's one不能为空" },
              { validator: this.validator, message: "自定义校验固定提示" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            rules={[{ required: true, message: "list's two不能为空" }]}
          >
            <Input />
          </Form.Item>
        </Form.List>
        <Form.Item label="">
          <button>Submit</button>
        </Form.Item>
      </Form>
    );
  }
}
```

## APIs

### 表单基础属性-base options

- `inline` 所有 Form.Item 组件设置行内布局，默认值为`false`。
- `compact` 所有 Form.Item 组件是否隐藏错误信息，默认值为`false`。
- `required` 所有 Form.Item 组件是否显示星号，不包含表单校验，仅用于显示，默认值为`false`。
- `labelWidth` 所有 Form.Item 组件自定义标签宽度，`可选`。
- `labelAlign` 所有 Form.Item 组件 `label`的排列，`可选`。
- `gutter` 所有 Form.Item 组件自定义标签和表单组件间的距离，`可选`。
   

### Form Props
继承表单基础属性（base options）

- `className` 表单元素类名，`可选`。
- `store` 表单数据存储，`必须`。
- `initialValues` 表单的初始值，会被表单域的`initialValue`覆盖, 注意此值只能初始化表单赋值`可选`。
- `onSubmit` 表单提交回调，`可选`。
- `onMount` 表单渲染完毕的回调，`可选`。
- `onReset` 表单重置默认值，`可选`。
- `onFieldsChange` 表单域 onChange 变化时的事件函数，只会被控件主动`onChange`触发，不会被`store.setFieldValue`和`store.setFieldsValue`触发, 避免循环调用。`可选`。
- `onValuesChange` 监听表单值的变化。(不监听`initialValue`赋值)`可选`。


### Form.Item Props
继承表单基础属性（base options）

- `className` 表单域类名，`可选`。
- `label` 表单域标签，`可选`。
- `name` 表单域字段名，`可选`。
- `suffix` 后缀节点，`可选`。
- `initialValue` 表单域的初始值，注意此值和`value`不同，只能初始化表单赋值`可选`。
- `rules` 表单域的校验规则 `可选`。
- `valueProp` 填写到子组件的值属性名，默认值为`'value'`。
- `valueGetter` 从表单事件中获取表单值的方式，`可选`。
- `onFieldsChange` 表单域 onChange 变化时的事件函数，只会被控件主动`onChange`触发，不会被`store.setFieldValue`和`store.setFieldsValue`触发, 避免循环调用。`可选`。
- `onValuesChange` 监听表单值的变化。`可选`。
- `errorClassName` 控件当有错误信息时，添加一个自定义类名，`可选`。

### Form.List Props
继承表单基础属性（base options）

- `className` 表单域类名，`可选`。
- `label` 表单域标签，`可选`。
- `name` 表单域字段名，`可选`。
- `suffix` 后缀节点，`可选`。
- `initialValue` 表单域的初始值，注意此值和`value`不同，只能初始化表单赋值`可选`。
- `rules` 表单域的校验规则 `可选`。

### 表单的rules中的校验字段
`rules`中的值的字段中的规则会按照顺序执行校验，`rules`中每一项只能设置一种规则。
- `message` 校验规则报错时，默认的报错信息 `可选`。
- `required` 表示控件值为必填 `可选`。
- `validator` 类型：`(value, callback: (err: string) => void) => void | boolean` 自定义校验函数, `value`为当前控件值, `callback`可以主动调用报错方法 `可选`。
- `pattern` 类型：`RegExp | string` 表达式校验，不符合则报错 `可选`。
- `whitespace` 类型：`boolean` 针对`string`类型, 设置true校验空格 `可选`。
- `max` 类型：`number` 表单值为string类型时字符串最大长度；number 类型时为最大值；array 类型时为数组最大长度 `可选`。
- `min` 类型：`number` 表单值为string类型时字符串最小长度；number 类型时为最小值；array 类型时为数组最小长度 `可选`。

### FormStore Methods

- `new FormStore(defaultValues)` 创建表单存储。
- `store.getFieldValue()` 返回整个表单的值。
- `store.getFieldValue(name: string | string[])` 根据字段名返回表单域的值。当 `name` 为数组时，返回多个表单域的值
- `store.setFieldValue(name, value)` 更新表单域的值
- `store.setFieldsValue(obj: Partial<T>)` 设置表单域的值(覆盖)。
- `store.reset()` 重置表单。
- `store.validate()` 校验整个表单，并返回错误信息和表单值。
- `store.validate(name)` 根据字段名校验表单域的值，并返回错误信息和表单值。
- `store.getFieldError(name?: string)` 返回单个表单域的错误信息或表单所有的错误信息。
- `store.getFieldProps(name?: string)` 根据字段名返回表单域的`props`

### Hooks

- `useFormStore(defaultValues)` 使用 hooks 创建 FormStore。

# Contribute
感谢来自react-hero-form提供的灵感支持。