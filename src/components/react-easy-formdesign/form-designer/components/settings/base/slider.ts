const baseSettings = {
  initialValue: {
    label: '默认值',
    type: 'InputNumber',
  },
  props: {
    compact: true,
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
