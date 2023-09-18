const baseSetting = {
  props: {
    properties: {
      minRows: {
        label: '最小行数',
        type: 'InputNumber',
        initialValue: 0
      },
      maxRows: {
        label: '最大行数',
        type: 'InputNumber',
        initialValue: 50
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
      showBtn: {
        type: 'DynamicSetting',
        inline: true,
        compact: true,
        props: { children: '可增删' }
      },
    }
  }
}

const rulesSetting = {
  rules: {
    type: 'RulesComponent',
    compact: true,
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
