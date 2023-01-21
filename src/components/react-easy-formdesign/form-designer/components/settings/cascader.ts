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
          includes: ['json', 'request']
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