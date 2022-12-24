// 默认的表单域显示组件的属性
const settings = {
  label: {
    label: '标签名称',
    type: 'Input'
  },
  layout: {
    label: "标签布局",
    type: "Radio.Group",
    initialValue: "horizontal",
    props: {
      style: { width: '100%' },
      children: [
        { type: "Radio", props: { key: 'horizontal', value: "horizontal", children: "同行" } },
        { type: "Radio", props: { key: 'vertical', value: "vertical", children: "单独一行" } }
      ]
    }
  },
  gutter: {
    label: '标签间距',
    type: 'InputNumber',
    props: {
      min: 0,
      max: 300
    }
  },
  labelWidth: {
    label: '标签宽度',
    type: 'InputNumber',
    initialValue: 120,
    props: {
      min: 0,
      max: 300
    }
  },
  labelAlign: {
    label: "标签水平排列",
    type: "Radio.Group",
    initialValue: 'right',
    props: {
      style: { width: '100%' },
      children: [
        { type: "Radio", props: { key: 'left', value: "left", children: "左边对齐" } },
        { type: "Radio", props: { key: 'center', value: "center", children: "居中" } },
        { type: "Radio", props: { key: 'right', value: "right", children: "右边对齐" } },
      ]
    }
  },
  suffix: {
    label: '后缀',
    type: 'Input'
  },
  footer: {
    label: '描述',
    type: 'Input'
  },
  colon: {
    label: '携带冒号',
    type: 'Switch',
    valueProp: 'checked',
    initialValue: false,
  },
  required: {
    label: '必填标志',
    type: 'Switch',
    valueProp: 'checked',
    initialValue: false,
  },
}

export default ['表单域设置', settings] as [string, typeof settings]