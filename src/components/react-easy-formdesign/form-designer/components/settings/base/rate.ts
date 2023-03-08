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
      allowClear: {
        type: 'LinkageCheckbox',
        inline: true,
        props: { children: '可清除' }
      },
      allowHalf: {
        type: 'LinkageCheckbox',
        inline: true,
        props: { children: '可半选' }
      },
    }
  }
}

export const rate_operation = ['操作属性', operationSettings] as [string, typeof operationSettings]

const rulesSettings = {
  rules: {
    type: 'RulesComponent',
    props: {
      includes: ['required', 'max', 'min'],
    }
  },
}

export const rate_rule = ['校验规则', rulesSettings] as [string, typeof rulesSettings]