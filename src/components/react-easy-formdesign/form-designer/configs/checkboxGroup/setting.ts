const baseSetting = {
  initialValue: {
    label: '默认值',
    type: 'CodeTextArea',
  },
  props: {
    properties: {
      options: {
        type: 'SetOptions',
        label: '选项数据',
        props: {
        }
      },
    }
  }
}

const operationSetting = {
  hidden: {
    type: 'DynamicSetting',
    inline: true,
    compact: true,
    props: { children: '隐藏' }
  },
  props: {
    properties: {
      disabled: {
        type: 'DynamicSetting',
        inline: true,
        compact: true,
        props: { children: '禁用' }
      },
    }
  }
}

const rulesSetting = {
  rules: {
    type: 'RulesComponent',
    props: {
      includes: ['required']
    }
  },
}

const setting = {
  '基础属性': baseSetting,
  '操作属性': operationSetting,
  '校验规则': rulesSetting,
}

export default setting;
