const settings = {
  initialValue: {
    label: '默认值',
    type: 'Cascader',
    props: {
      options: "{{formvalues.props && formvalues.props.options ? formvalues.props.options : []}}",
      multiple: "{{formvalues.props && formvalues.props.multiple ? formvalues.props.multiple : undefined}}",
    }
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
      multiple: {
        type: 'LinkageCheckbox',
        inline: true,
        props: { children: '多选' }
      },
      showSearch: {
        type: 'LinkageCheckbox',
        inline: true,
        props: { children: '可搜索' }
      },
    }
  }
}

export const cascader_operation = ['操作属性', operationSettings] as [string, typeof operationSettings]

const rulesSettings = {
  rules: {
    type: 'RulesComponent',
    props: {
      includes: ['required']
    }
  },
}

export const cascader_rule = ['校验规则', rulesSettings] as [string, typeof rulesSettings]