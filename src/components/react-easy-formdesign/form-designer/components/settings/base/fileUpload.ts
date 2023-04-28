const settings = {
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

export default ['基础属性', settings] as [string, typeof settings]

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
    component: null,
    properties: {
      disabled: {
        type: 'LinkageCheckbox',
        inline: true,
        props: { children: '禁用' }
      },
    }
  }
}

export const fileUpload_operation = ['操作属性', operationSettings] as [string, typeof operationSettings]

const rulesSettings = {
  rules: {
    type: 'RulesComponent',
    props: {
      includes: ['required']
    }
  },
}

export const fileUpload_rule = ['校验规则', rulesSettings] as [string, typeof rulesSettings]