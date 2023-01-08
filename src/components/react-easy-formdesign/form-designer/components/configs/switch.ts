import {
  disabled,
  initialValue,
  size
} from "./common";

export default {
  id: 'switch',
  label: '开关',
  type: 'Switch',
  valueProp: 'checked',
  props: {
  },
  settings: {
    initialValue: {
      label: '默认值',
      type: 'Switch',
      valueProp: 'checked',
    },
    props: {
      compact: true,
      properties: {
        size: size,
        disabled: disabled,
      }
    }
  },
}
