const settings = {
  initialValue: {
    label: '默认值',
    type: 'Input',
  },
  props: {
    compact: true,
    properties: {
      disabled: {
        label: '禁用',
        type: 'Switch',
        valueProp: 'checked',
      },
    }
  }
}

export default ['控件属性', settings] as [string, typeof settings]