const baseSetting = {
  props: {
    properties: {
      maxCount: {
        label: '最大允许上传个数',
        type: 'InputNumber',
        initialValue: 5
      },
      fileSizeLimit: {
        label: '文件大小限制(MB)',
        type: 'InputNumber',
        initialValue: 5
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
