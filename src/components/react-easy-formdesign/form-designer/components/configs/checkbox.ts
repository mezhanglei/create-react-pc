import {
  disabled,
  initialValue
} from "./common";

export default {
  id: 'checkbox',
  label: '多选框',
  type: 'Checkbox.Group',
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
        disabled: disabled,
      }
    }
  },
}
