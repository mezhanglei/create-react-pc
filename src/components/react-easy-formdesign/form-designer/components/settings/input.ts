const settings = {
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
  initialValue: {
    label: '默认值',
    type: 'CodeTextArea'
  },
  // === 控件自身的props的设置
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
        label: "尺寸",
        type: "Radio.Group",
        initialValue: 'middle',
        props: {
          style: { width: '100%' },
          options: [
            { label: '大', value: 'large' },
            { label: '中', value: 'middle' },
            { label: '小', value: 'small' }
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
}

export default ['控件属性', settings] as [string, typeof settings]