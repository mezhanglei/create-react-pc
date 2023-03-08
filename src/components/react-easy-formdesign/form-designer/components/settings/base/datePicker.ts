const settings = {
  initialValue: {
    label: '默认值',
    type: 'DatePicker',
    valueSetter: "{{(value)=> (value && moment(value, formvalues.props && formvalues.props.format || 'YYYY-MM-DD' ))}}",
    valueGetter: "{{(value) => (value && moment(value).format(formvalues.props && formvalues.props.format || 'YYYY-MM-DD'))}}",
    props: {
      picker: "{{formvalues.props && formvalues.props.picker}}",
      format: "{{formvalues.props && formvalues.props.format}}",
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
        props: { children: '可清除' }
      },
    }
  }
}

export const datePicker_operation = ['操作属性', operationSettings] as [string, typeof operationSettings]

const rulesSettings = {
  rules: {
    type: 'RulesComponent',
    props: {
      includes: ['required']
    }
  },
}

export const datePicker_rule = ['校验规则', rulesSettings] as [string, typeof rulesSettings]