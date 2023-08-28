const baseSetting = {
  initialValue: {
    label: '默认值',
    type: 'CodeTextArea',
  },
  props: {
    properties: {
      options: {
        type: 'OptionsComponent',
        label: '选项数据',
        props: {
          includes: ['json', 'request', 'linkage']
        }
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
      allowClear: {
        type: 'LinkageCheckbox',
        inline: true,
        props: { children: '可清除' }
      },
      multiple: {
        type: 'LinkageCheckbox',
        inline: true,
        props: { children: '多选' }
      },
      showSearch: {
        type: 'LinkageCheckbox',
        inline: true,
        props: { children: '可搜索' }
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