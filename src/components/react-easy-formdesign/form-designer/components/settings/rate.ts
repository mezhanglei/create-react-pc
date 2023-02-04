const settings = {
  initialValue: {
    label: '默认值',
    type: 'InputNumber',
  },
  props: {
    compact: true,
    properties: {
      count: {
        label: 'star总数',
        type: 'InputNumber',
        initialValue: 5
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
      allowHalf: {
        type: 'Checkbox',
        inline: true,
        valueProp: 'checked',
        props: { children: '可半选' }
      },
    }
  }
}

export const rate_operation = ['操作属性', operationSettings] as [string, typeof operationSettings]