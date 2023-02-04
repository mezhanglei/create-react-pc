const settings = {
  initialValue: {
    label: '默认值',
    type: 'Input',
  },
  // props: {
  //   compact: true,
  //   properties: {

  //   }
  // }
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

export const colorPicker_operation = ['操作属性', operationSettings] as [string, typeof operationSettings]