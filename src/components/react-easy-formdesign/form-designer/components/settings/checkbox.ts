const settings = {
  initialValue: {
    label: '默认值',
    type: 'CodeTextArea'
  },
  props: {
    compact: true,
    properties: {
      options: {
        type: 'OptionsComponent',
        label: '选项数据',
        props: {
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
    }
  }
}

export const checkbox_operation = ['操作属性', operationSettings] as [string, typeof operationSettings]