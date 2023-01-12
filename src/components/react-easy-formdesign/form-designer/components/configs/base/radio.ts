import {
  disabled,
  initialValue,
  size
} from "./common";

export default {
  id: 'radio',
  label: '单选框',
  type: 'Radio.Group',
  props: {
    options: [{ label: '选项1', value: '1' }, { label: '选项2', value: '2' }]
  },
  settings: {
    initialValue: initialValue,
    props: {
      compact: true,
      properties: {
        options: {
          type: 'OptionsComponent',
          label: '选项数据',
          props: {
          }
        },
        optionType: {
          label: "样式",
          type: "Radio.Group",
          initialValue: 'default',
          props: {
            style: { width: '100%' },
            options: [
              { label: '默认', value: 'default' },
              { label: '按钮', value: 'button' }
            ]
          }
        },
        size: size,
        disabled: disabled,
      }
    }
  },
}
