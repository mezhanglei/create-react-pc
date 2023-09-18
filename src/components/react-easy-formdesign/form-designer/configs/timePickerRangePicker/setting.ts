const baseSetting = {
  initialValue: {
    label: '默认值',
    type: 'TimePicker.RangePicker',
    valueSetter: "{{(value)=> value instanceof Array && value.map((item) => typeof item === 'string' && moment(item, 'HH:mm:ss'))}}",
    valueGetter: "{{(value) => value instanceof Array && value.map((item) => moment.isMoment(item) && item.format(formvalues.props && formvalues.props.format || 'HH:mm:ss'))}}",
    props: {
      format: "{{formvalues.props && formvalues.props.format}}",
      use12Hours: "{{formvalues.props && formvalues.props.use12Hours}}",
    }
  },
  props: {
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
        initialValue: true,
        props: { children: '可清除' }
      },
      use12Hours: {
        type: 'DynamicSetting',
        inline: true,
        compact: true,
        props: { children: '12小时制' }
      },
    }
  }
}

const rulesSetting = {
  rules: {
    type: 'RulesComponent',
    compact: true,
    props: {
      includes: ['required'],
    }
  },
}

const setting = {
  '基础属性': baseSetting,
  '操作属性': operationSetting,
  '校验规则': rulesSetting,
}

export default setting;
