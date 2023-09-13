const baseSetting = {
  initialValue: {
    label: '默认值',
    type: 'DatePicker.RangePicker',
    valueSetter: "{{(value)=> value instanceof Array && value.map((item) => typeof item === 'string' && moment(item))}}",
    valueGetter: "{{(value) => value instanceof Array && value.map((item) => moment.isMoment(item) && moment(item).format(formvalues.props && formvalues.props.format || 'YYYY-MM-DD'))}}",
    props: {
      picker: "{{formvalues.props && formvalues.props.picker}}",
      format: "{{formvalues.props && formvalues.props.format}}",
    }
  },
  props: {
    properties: {
      placeholder: {
        label: '占位字符',
        type: 'Input',
        initialValue: '请输入'
      },
      picker: {
        label: "选择器类型",
        type: "Select",
        initialValue: 'date',
        props: {
          style: { width: '100%' },
          options: [
            { label: '日', value: 'date' },
            { label: '周', value: 'week' },
            { label: '月', value: 'month' },
            { label: '季度', value: 'quarter' },
            { label: '年', value: 'year' },
          ]
        }
      },
      format: {
        label: "显示格式",
        type: "Select",
        initialValue: 'YYYY-MM-DD',
        props: {
          style: { width: '100%' },
          options: [
            { label: '年月日', value: 'YYYY-MM-DD' },
            { label: '年月', value: 'YYYY-MM' },
            { label: '月日', value: 'MM-DD' },
            { label: '年', value: 'YYYY' },
            { label: '月', value: 'MM' },
            { label: '日', value: 'DD' },
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
    type: 'LinkageCheckbox',
    inline: true,
    compact: true,
    props: { children: '隐藏' }
  },
  props: {
    properties: {
      disabled: {
        type: 'LinkageCheckbox',
        inline: true,
        compact: true,
        props: { children: '禁用' }
      },
      allowClear: {
        type: 'LinkageCheckbox',
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
