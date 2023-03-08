const settings = {
  initialValue: {
    label: '默认值',
    type: 'TimePicker',
    valueSetter: "{{(value)=> (value && moment(value, formvalues.props && formvalues.props.format || 'HH:mm:ss' ))}}",
    valueGetter: "{{(value) => (value && moment(value).format(formvalues.props && formvalues.props.format || 'HH:mm:ss'))}}",
    props: {
      format: "{{formvalues.props && formvalues.props.format}}",
      use12Hours: "{{formvalues.props && formvalues.props.use12Hours || 'HH:mm:ss'}}",
    }
  },
  props: {
    compact: true,
    properties: {
      placeholder: {
        label: '占位字符',
        type: 'Input',
        initialValue: '请输入'
      },
      format: {
        label: "显示格式",
        type: "Select",
        initialValue: 'HH:mm:ss',
        props: {
          style: { width: '100%' },
          options: [
            { label: '时分秒', value: 'HH:mm:ss' },
            { label: '时分', value: 'HH:mm' },
            { label: '分秒', value: 'mm:ss' },
            { label: '小时', value: 'HH' },
            { label: '分钟', value: 'mm' },
            { label: '秒', value: 'ss' },
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
    component: null,
    properties: {
      disabled: {
        type: 'LinkageCheckbox',
        inline: true,
        props: { children: '禁用' }
      },
      allowClear: {
        type: 'LinkageCheckbox',
        inline: true,
        initialValue: true,
        props: { children: '可清除' }
      },
      use12Hours: {
        type: 'LinkageCheckbox',
        inline: true,
        props: { children: '12小时制' }
      },
    }
  }
}

export const timePicker_operation = ['操作属性', operationSettings] as [string, typeof operationSettings]

const rulesSettings = {
  rules: {
    type: 'RulesComponent',
    props: {
      includes: ['required'],
    }
  },
}

export const timePicker_rule = ['校验规则', rulesSettings] as [string, typeof rulesSettings]