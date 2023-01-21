const settings = {
  initialValue: {
    label: '默认值',
    type: 'CodeTextArea'
  },
  props: {
    compact: true,
    properties: {
      placeholder: {
        label: '占位字符',
        type: 'Input',
        initialValue: '请输入'
      },
      options: {
        type: 'OptionsComponent',
        label: '选项数据',
        props: {
        }
      },
      mode: {
        label: '选择模式',
        type: "Radio.Group",
        props: {
          style: { width: '100%' },
          options: [
            { label: '单选', },
            { label: '多选', value: 'multiple' },
            { label: '标签', value: 'tags' }
          ]
        }
      },
      maxTagCount: {
        label: '标签最大数量',
        type: 'InputNumber',
        hidden: "{{$formvalues.props.mode !== 'tags'}}",
        initialValue: 10
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
      showSearch: {
        label: '是否可以搜索',
        type: 'Switch',
        valueProp: 'checked',
        initialValue: true
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