const settings = {
  initialValue: {
    label: '默认值',
    type: 'InputNumber',
  },
  props: {
    compact: true,
    properties: {
      count: {
        label: 'star总数',
        type: 'InputNumber',
        initialValue: 5
      },
      allowHalf: {
        label: '是否允许半选',
        type: 'Switch',
        valueProp: 'checked',
      },
      allowClear: {
        label: '是否允许再次点击后清除',
        type: 'Switch',
        valueProp: 'checked',
        initialValue: true,
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