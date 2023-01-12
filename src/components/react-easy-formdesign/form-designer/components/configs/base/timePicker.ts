import {
  allowClear,
  disabled,
  placeholder,
  size
} from "./common";

export default {
  id: 'timePicker',
  label: '时间选择器',
  type: 'TimePicker',
  props: {
  },
  settings: {
    initialValue: {
      label: '默认值',
      type: 'TimePicker',
    },
    props: {
      compact: true,
      properties: {
        placeholder: placeholder,
        format: {
          label: "格式化",
          type: "Select",
          initialValue: 'HH:mm:ss',
          props: {
            style: { width: '100%' },
            options: [
              { label: '时分秒', value: 'HH:mm:ss' },
              { label: '时分', value: 'HH:mm' },
              { label: '分秒', value: 'mm:ss' },
              { label: '小时', value: 'HH' },
              { label: '分钟', value: 'mm' },
              { label: '秒', value: 'ss' },
            ]
          }
        },
        size: size,
        use12Hours: {
          label: '12小时制',
          type: 'Switch',
          valueProp: 'checked',
        },
        disabled: disabled,
        allowClear: allowClear,
      }
    }
  },
}
