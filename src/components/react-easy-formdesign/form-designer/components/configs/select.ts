import {
  allowClear,
  disabled,
  initialValue,
  placeholder,
  size
} from "./common";

export default {
  id: 'select',
  label: '下拉框',
  type: 'Select',
  props: {
    // style: { width: "100%" },
    options: [{ label: '选项1', value: '1' }, { label: '选项2', value: '2' }]
  },
  settings: {
    initialValue: initialValue,
    props: {
      compact: true,
      properties: {
        placeholder: placeholder,
        options: {
          type: 'OptionsComponent',
          label: '选项数据',
          props: {
          }
        },
        mode: {
          label: '选择模式',
          type: "Radio.Group",
          props: {
            style: { width: '100%' },
            options: [
              { label: '单选', },
              { label: '多选', value: 'multiple' },
              { label: '标签', value: 'tags' }
            ]
          }
        },
        maxTagCount: {
          label: '标签最大数量',
          type: 'InputNumber',
          hidden: "{{$formvalues.props.mode !== 'tags'}}",
          initialValue: 10
        },
        size: size,
        showSearch: {
          label: '是否可以搜索',
          type: 'Switch',
          valueProp: 'checked',
          initialValue: true
        },
        disabled: disabled,
        allowClear: allowClear,
      }
    }
  },
}
