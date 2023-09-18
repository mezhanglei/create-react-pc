const baseSetting = {
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
      allowClear: {
        type: 'DynamicSetting',
        inline: true,
        compact: true,
        props: { children: '可清除' }
      },
      allowHalf: {
        type: 'DynamicSetting',
        inline: true,
        compact: true,
        props: { children: '可半选' }
      },
    }
  }
}

const rulesSetting = {
  rules: {
    type: 'RulesComponent',
    compact: true,
    props: {
      includes: ['required', 'max', 'min'],
    }
  },
}

const setting = {
  '基础属性': baseSetting,
  '操作属性': operationSetting,
  '校验规则': rulesSetting,
}

export default setting;
