const settings = {
  initialValue: {
    label: '默认值',
    type: 'CodeTextArea',
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
        type: "Select",
        props: {
          style: { width: '100%' },
          allowClear: true,
          options: [
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
  hidden: {
    type: 'LinkageCheckbox',
    inline: true,
    props: { children: '隐藏' }
  },
  props: {
    compact: true,
    inline: true,
    fieldComponent: null,
    properties: {
      disabled: {
        type: 'LinkageCheckbox',
        inline: true,
        props: { children: '禁用' }
      },
      allowClear: {
        type: 'LinkageCheckbox',
        inline: true,
        props: { children: '可清除' }
      },
      showSearch: {
        type: 'LinkageCheckbox',
        inline: true,
        props: { children: '可搜索' }
      },
    }
  }
}

export const select_operation = ['操作属性', operationSettings] as [string, typeof operationSettings]

const rulesSettings = {
  rules: {
    type: 'RulesComponent',
    props: {
      includes: ['required'],
    }
  },
}

export const select_rule = ['校验规则', rulesSettings] as [string, typeof rulesSettings]