const settings = {
  initialValue: {
    label: '默认值',
    type: 'DatePicker',
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
  props: {
    compact: true,
    inline: true,
    properties: {
      disabled: {
        type: 'Checkbox',
        inline: true,
        valueProp: 'checked',
        props: { children: '禁用' }
      },
      allowClear: {
        type: 'Checkbox',
        inline: true,
        valueProp: 'checked',
        props: { children: '可清除' }
      },
    }
  }
}

export const datePicker_operation = ['操作属性', operationSettings] as [string, typeof operationSettings]