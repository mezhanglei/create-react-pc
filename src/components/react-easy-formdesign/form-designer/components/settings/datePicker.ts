const settings = {
  initialValue: {
    label: '默认值',
    type: 'DatePicker',
  },
  props: {
    compact: true,
    properties: {
      placeholder: {
        label: '占位字符',
        type: 'Input',
        initialValue: '请输入'
      },
      picker: {
        label: "选择器类型",
        type: "Select",
        initialValue: 'date',
        props: {
          style: { width: '100%' },
          options: [
            { label: '日', value: 'date' },
            { label: '周', value: 'week' },
            { label: '月', value: 'month' },
            { label: '季度', value: 'quarter' },
            { label: '年', value: 'year' },
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