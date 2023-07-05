const baseSettings = {
  initialValue: {
    label: '默认值',
    type: 'InputNumber',
  },
  props: {
    properties: {
      count: {
        label: 'star总数',
        type: 'InputNumber',
        initialValue: 5
      },
    }
  }
}

const operationSettings = {
  hidden: {
    type: 'LinkageCheckbox',
    inline: true,
    props: { children: '隐藏' }
  },
  props: {
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

const rulesSettings = {
  rules: {
    type: 'RulesComponent',
    props: {
      includes: ['required', 'max', 'min'],
    }
  },
}

const settings = {
  '基础属性': baseSettings,
  '操作属性': operationSettings,
  '校验规则': rulesSettings,
}

export default settings;
