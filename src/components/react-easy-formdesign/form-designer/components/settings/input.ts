const settings = {
  // == 表单域上的属性
  type: {
    label: "输入框类型",
    type: "Select",
    initialValue: "Input",
    props: {
      style: { width: '100%' },
      options: [
        { label: '单行输入', value: 'Input' },
        { label: '多行输入', value: 'Input.TextArea' },
        { label: '数字输入', value: 'InputNumber' },
        { label: '密码输入', value: 'Input.Password' },
      ]
    }
  },
  initialValue: {
    label: '默认值',
    type: '{{formvalues["type"] ? formvalues["type"] : "Input"}}'
  },
  // === 控件自身的props的设置
  props: {
    compact: true,
    properties: {
      placeholder: {
        label: '占位字符',
        type: 'Input',
        initialValue: '请输入'
      },
      maxLength: {
        label: '最大输入字符数',
        type: 'InputNumber',
        initialValue: 30
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

export default ['基础属性', settings] as [string, typeof settings]

const operationSettings = {
  hidden: {
    type: 'LinkageCheckbox',
    inline: true,
    props: { children: '隐藏' }
  },
  props: {
    compact: true,
    inline: true,
    fieldComponent: null,
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
    }
  }
}

export const input_operation = ['操作属性', operationSettings] as [string, typeof operationSettings]

const rulesSettings = {
  rules: {
    type: 'RulesComponent',
    props: {
      includes: ['required', 'pattern', 'max', 'min'],
    }
  },
}

export const input_rule = ['校验规则', rulesSettings] as [string, typeof rulesSettings]