const settings = {
  initialValue: {
    label: '默认值',
    type: 'Switch',
    valueProp: 'checked',
  },
  props: {
    compact: true,
    properties: {
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