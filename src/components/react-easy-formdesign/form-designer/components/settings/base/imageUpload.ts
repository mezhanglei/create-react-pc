const baseSettings = {
  props: {
    compact: true,
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
