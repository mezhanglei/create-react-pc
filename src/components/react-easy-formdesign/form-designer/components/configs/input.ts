import CommonProps from './common-props';

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
        children: [
          { type: "Select.Option", props: { key: 'Input', value: "Input", children: "单行输入" } },
          { type: "Select.Option", props: { key: 'Input.TextArea', value: "Input.TextArea", children: "多行输入" } },
          { type: "Select.Option", props: { key: 'InputNumber', value: "InputNumber", children: "数字输入" } },
          { type: "Select.Option", props: { key: 'Input.Password', value: "Input.Password", children: "密码输入" } }
        ]
      }
    },
    initialValue: {
      label: '默认值',
      type: 'Input'
    },
    // === 控件自身的props的设置
    props: {
      compact: true,
      properties: {
        ...CommonProps,
        allowClear: {
          label: '是否可以清除',
          type: 'Switch',
          valueProp: 'checked',
          initialValue: true
        },
      }
    }
  },
}
