const baseSetting = {
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
    type: 'Input',
  },
  // === 控件自身的props的设置
  props: {
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
      allowClear: {
        type: 'DynamicSetting',
        inline: true,
        compact: true,
        props: { children: '可清除' }
      },
    }
  }
}

const rulesSetting = {
  rules: {
    type: 'RulesComponent',
    compact: true,
    props: {
      includes: ['required', 'pattern', 'max', 'min'],
    }
  },
}

const setting = {
  '基础属性': baseSetting,
  '操作属性': operationSetting,
  '校验规则': rulesSetting,
}

export default setting;
