const settings = {
  initialValue: {
    label: '默认值',
    type: 'CodeTextArea',
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
    component: null,
    properties: {
      disabled: {
        type: 'LinkageCheckbox',
        inline: true,
        props: { children: '禁用' }
      },
    }
  }
}
export const checkbox_operation = ['操作属性', operationSettings] as [string, typeof operationSettings]

const rulesSettings = {
  rules: {
    type: 'RulesComponent',
    props: {
      includes: ['required']
    }
  },
}
export const checkbox_rule = ['校验规则', rulesSettings] as [string, typeof rulesSettings]