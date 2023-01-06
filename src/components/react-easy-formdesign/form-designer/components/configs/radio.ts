import CommonProps from './common-props';

export default {
  id: 'radio',
  label: '单选框',
  type: 'Radio.Group',
  props: {
    options: [{ label: '选项1', value: '1' }]
  },
  settings: {
    initialValue: {
      label: '默认值',
      type: 'Input'
    },
    props: {
      compact: true,
      properties: {
        options: {
          type: 'DataSourceComponent',
          label: '选项数据',
          props: {
          }
        },
        ...CommonProps
      }
    }
  },
}
