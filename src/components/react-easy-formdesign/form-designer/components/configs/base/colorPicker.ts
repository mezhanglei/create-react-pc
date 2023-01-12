import {
  disabled,
  size
} from "./common";

export default {
  id: 'colorPicker',
  label: '颜色选择器',
  type: 'ColorPicker',
  props: {
  },
  settings: {
    initialValue: {
      label: '默认值',
      type: 'Input',
    },
    props: {
      compact: true,
      properties: {
        disabled: disabled,
      }
    }
  },
}
