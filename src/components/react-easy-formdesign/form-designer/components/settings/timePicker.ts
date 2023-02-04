const settings = {
  initialValue: {
    label: '默认值',
    type: 'TimePicker',
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
        label: "格式化",
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
        initialValue: true,
        props: { children: '可清除' }
      },
      use12Hours: {
        type: 'Checkbox',
        inline: true,
        valueProp: 'checked',
        props: { children: '12小时制' }
      },
    }
  }
}

export const timePicker_operation = ['操作属性', operationSettings] as [string, typeof operationSettings]