export default {
  id: 'input',
  label: '输入框',
  type: 'Input',
  settings: {
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
    // 控件自身的属性
    props: {
      compact: true,
      properties: {
        placeholder: {
          label: '占位字符',
          type: 'Input',
          initialValue: '请输入'
        },
        maxLength: {
          label: '最大输入字符数',
          type: 'InputNumber',
          initialValue: 30
        },
        size: {
          label: "大小",
          type: "Radio.Group",
          initialValue: 'middle',
          props: {
            style: { width: '100%' },
            children: [
              { type: "Radio", props: { key: 'large', value: "large", children: "大" } },
              { type: "Radio", props: { key: 'middle', value: "middle", children: "中" } },
              { type: "Radio", props: { key: 'small', value: "small", children: "小" } },
            ]
          }
        },
        disabled: {
          label: '禁用',
          type: 'Switch',
          valueProp: 'checked',
        },
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
