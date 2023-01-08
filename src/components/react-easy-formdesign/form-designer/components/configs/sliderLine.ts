import {
  disabled,
} from "./common";

export default {
  id: 'slider',
  label: '滑块',
  type: 'Slider',
  props: {
    style: { width: '100%' }
  },
  settings: {
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
        vertical: {
          label: '是否垂直',
          type: 'Switch',
          valueProp: 'checked',
        },
        reverse: {
          label: '反向轴',
          type: 'Switch',
          valueProp: 'checked',
        },
        disabled: disabled,
      }
    }
  },
}
