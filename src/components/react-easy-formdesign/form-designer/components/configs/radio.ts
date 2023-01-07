import CommonProps from './common-props';

export default {
  id: 'radio',
  label: '单选框',
  type: 'Radio.Group',
  props: {
    options: [{ label: '选项1', value: '1' }, { label: '选项2', value: '2' }]
  },
  settings: {
    initialValue: {
      label: '默认值',
      type: 'CodeInput',
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
        ...CommonProps
      }
    }
  },
}
