const settings = {
  // initialValue: {
  //   label: '默认值',
  //   type: 'CodeTextArea'
  // },
  initialValue: {
    label: '默认值',
    type: 'Select',
    compact: true,
    props: {
      style: { width: "100%" },
      options: "{{formvalues && formvalues.props ? formvalues.props.options : []}}"
    }
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
        hidden: "{{formvalues && formvalues.props && formvalues.props.mode !== 'tags'}}",
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
    }
  }
}

export default ['基础属性', settings] as [string, typeof settings]

const operationSettings = {
  props: {
    compact: true,
    inline: true,
    properties: {
      disabled: {
        type: 'Checkbox',
        inline: true,
        valueProp: 'checked',
        props: { children: '禁用' }
      },
      allowClear: {
        type: 'Checkbox',
        inline: true,
        valueProp: 'checked',
        props: { children: '可清除' }
      },
      showSearch: {
        type: 'Checkbox',
        inline: true,
        valueProp: 'checked',
        props: { children: '可搜索' }
      },
    }
  }
}

export const select_operation = ['操作属性', operationSettings] as [string, typeof operationSettings]