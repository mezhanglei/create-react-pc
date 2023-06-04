const baseSettings = {
  initialValue: {
    label: '默认值',
    type: 'Input',
  },
  props: {
    properties: {
      options: {
        type: 'OptionsComponent',
        label: '选项数据',
        props: {
        }
      },
      optionType: {
        label: "样式",
        type: "Radio.Group",
        initialValue: 'default',
        props: {
          style: { width: '100%' },
          options: [
            { label: '默认', value: 'default' },
            { label: '按钮', value: 'button' }
          ]
        }
      },
      size: {
        label: "尺寸",
        type: "Radio.Group",
        initialValue: 'middle',
        props: {
          style: { width: '100%' },
          options: [
            { label: '大', value: 'large' },
            { label: '中', value: 'middle' },
            { label: '小', value: 'small' }
          ]
        }
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
    }
  }
}

const rulesSettings = {
  rules: {
    type: 'RulesComponent',
    props: {
      includes: ['required'],
    }
  },
}

const settings = {
  '基础属性': baseSettings,
  '操作属性': operationSettings,
  '校验规则': rulesSettings,
}

export default settings;
