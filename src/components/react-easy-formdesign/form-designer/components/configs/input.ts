import {
  allowClear,
  disabled,
  initialValue,
  maxLength,
  placeholder,
  size
} from "./common";

export default {
  id: 'input',
  label: '输入框',
  type: 'Input',
  settings: {
    // == 表单域上的属性
    type: {
      label: "输入框类型",
      type: "Select",
      initialValue: "Input",
      props: {
        style: { width: '100%' },
        options: [
          { label: '单行输入', value: 'Input' },
          { label: '多行输入', value: 'Input.TextArea' },
          { label: '数字输入', value: 'InputNumber' },
          { label: '密码输入', value: 'Input.Password' },
        ]
      }
    },
    initialValue: initialValue,
    // === 控件自身的props的设置
    props: {
      compact: true,
      properties: {
        placeholder: placeholder,
        maxLength: maxLength,
        size: size,
        disabled: disabled,
        allowClear: allowClear,
      }
    }
  },
}
