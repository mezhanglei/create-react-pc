// 控件自身公共的props的配置
export default {
  placeholder: {
    label: '占位字符',
    type: 'Input',
    initialValue: '请输入'
  },
  maxLength: {
    label: '最大输入字符数',
    type: 'InputNumber',
    initialValue: 30
  },
  size: {
    label: "大小",
    type: "Radio.Group",
    initialValue: 'middle',
    props: {
      style: { width: '100%' },
      children: [
        { type: "Radio", props: { key: 'large', value: "large", children: "大" } },
        { type: "Radio", props: { key: 'middle', value: "middle", children: "中" } },
        { type: "Radio", props: { key: 'small', value: "small", children: "小" } },
      ]
    }
  },
  disabled: {
    label: '禁用',
    type: 'Switch',
    valueProp: 'checked',
  },
  allowClear: {
    label: '是否可以清除',
    type: 'Switch',
    valueProp: 'checked',
    initialValue: true
  },
}