import {
  allowClear,
  disabled,
  placeholder,
  size
} from "./common";

export default {
  id: 'datePicker',
  label: '日期选择器',
  type: 'DatePicker',
  props: {
  },
  settings: {
    initialValue: {
      label: '默认值',
      type: 'DatePicker',
    },
    props: {
      compact: true,
      properties: {
        placeholder: placeholder,
        picker: {
          label: "选择器类型",
          type: "Select",
          initialValue: 'date',
          props: {
            style: { width: '100%' },
            options: [
              { label: '日', value: 'date' },
              { label: '周', value: 'week' },
              { label: '月', value: 'month' },
              { label: '季度', value: 'quarter' },
              { label: '年', value: 'year' },
            ]
          }
        },
        size: size,
        disabled: disabled,
        allowClear: allowClear,
      }
    }
  },
}
