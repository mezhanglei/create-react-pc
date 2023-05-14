const baseSettings = {
  initialValue: {
    label: '默认值',
    type: 'Input',
  },
}

const operationSettings = {
  hidden: {
    type: 'LinkageCheckbox',
    inline: true,
    props: { children: '隐藏' }
  },
  showLabel: {
    type: 'LinkageCheckbox',
    inline: true,
    initialValue: true,
    props: { children: '标签' }
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

const rulesSettings = {
  rules: {
    type: 'RulesComponent',
    props: {
      includes: ['required']
    }
  },
}

const settings = {
  '基础属性': baseSettings,
  '操作属性': operationSettings,
  '校验规则': rulesSettings,
}

export default settings;
