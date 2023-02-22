const settings = {
  initialValue: {
    label: '默认值',
    type: 'Radio.Group',
    props: {
      options: "{{formvalues.props && formvalues.props.options ? formvalues.props.options : []}}",
    },
  },
  props: {
    compact: true,
    properties: {
      options: {
        type: 'OptionsComponent',
        label: '选项数据',
        props: {
        }
      },
      optionType: {
        label: "样式",
        type: "Radio.Group",
        initialValue: 'default',
        props: {
          style: { width: '100%' },
          options: [
            { label: '默认', value: 'default' },
            { label: '按钮', value: 'button' }
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
    }
  }
}

export const radio_operation = ['操作属性', operationSettings] as [string, typeof operationSettings]

const rulesSettings = {
  rules: {
    type: 'RulesComponent',
    props: {
      includes: ['required'],
    }
  },
}

export const radio_rule = ['校验规则', rulesSettings] as [string, typeof rulesSettings]