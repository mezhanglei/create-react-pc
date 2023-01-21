const settings = {
  initialValue: {
    label: '默认值',
    type: 'TimePicker',
  },
  props: {
    compact: true,
    properties: {
      placeholder: {
        label: '占位字符',
        type: 'Input',
        initialValue: '请输入'
      },
      format: {
        label: "格式化",
        type: "Select",
        initialValue: 'HH:mm:ss',
        props: {
          style: { width: '100%' },
          options: [
            { label: '时分秒', value: 'HH:mm:ss' },
            { label: '时分', value: 'HH:mm' },
            { label: '分秒', value: 'mm:ss' },
            { label: '小时', value: 'HH' },
            { label: '分钟', value: 'mm' },
            { label: '秒', value: 'ss' },
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
      use12Hours: {
        label: '12小时制',
        type: 'Switch',
        valueProp: 'checked',
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