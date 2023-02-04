const settings = {
  initialValue: {
    label: '默认值',
    type: 'InputNumber',
  },
  props: {
    compact: true,
    properties: {
      min: {
        label: '最小值',
        type: 'InputNumber',
        initialValue: 0
      },
      max: {
        label: '最大值',
        type: 'InputNumber',
        initialValue: 100
      },
      step: {
        label: '步长',
        type: 'InputNumber',
        initialValue: 1
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
      reverse: {
        type: 'Checkbox',
        inline: true,
        valueProp: 'checked',
        props: { children: '反向' }
      },
      vertical: {
        type: 'Checkbox',
        inline: true,
        valueProp: 'checked',
        props: { children: '垂直' }
      },
    }
  }
}

export const slider_operation = ['操作属性', operationSettings] as [string, typeof operationSettings]