const settings = {
  initialValue: {
    label: '默认值',
    type: 'CodeTextArea'
  },
  props: {
    compact: true,
    properties: {
      options: {
        type: 'OptionsComponent',
        label: '选项数据',
        props: {
        }
      },
      optionType: {
        label: "样式",
        type: "Radio.Group",
        initialValue: 'default',
        props: {
          style: { width: '100%' },
          options: [
            { label: '默认', value: 'default' },
            { label: '按钮', value: 'button' }
          ]
        }
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
    }
  }
}

export default ['控件属性', settings] as [string, typeof settings]