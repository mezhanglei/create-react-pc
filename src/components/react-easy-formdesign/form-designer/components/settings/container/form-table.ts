const baseSettings = {
  initialValue: {
    label: '默认值',
    type: '',
  },
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
    properties: {
      disabled: {
        type: 'LinkageCheckbox',
        inline: true,
        props: { children: '禁用' }
      },
      showBtn: {
        type: 'LinkageCheckbox',
        inline: true,
        props: { children: '可增删' }
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
