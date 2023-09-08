const baseSetting = {
  initialValue: {
    label: '默认值',
    type: 'InputNumber',
  },
  props: {
    properties: {
      min: {
        label: '最小值',
        type: 'InputNumber',
        initialValue: 0
      },
      max: {
        label: '最大值',
        type: 'InputNumber',
        initialValue: 100
      },
      step: {
        label: '步长',
        type: 'InputNumber',
        initialValue: 1
      },
    }
  }
}

const operationSetting = {
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
      reverse: {
        type: 'LinkageCheckbox',
        inline: true,
        props: { children: '反向' }
      },
      vertical: {
        type: 'LinkageCheckbox',
        inline: true,
        props: { children: '垂直' }
      },
    }
  }
}

const rulesSetting = {
  rules: {
    type: 'RulesComponent',
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
