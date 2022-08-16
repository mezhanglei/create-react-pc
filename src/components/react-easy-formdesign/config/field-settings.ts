// 表单域配置项
export const fieldSettings = {
  label: {
    label: '标签名称',
    type: 'Input'
  },
  layout: {
    label: "标签展示模式",
    type: "Radio.Group",
    initialValue: "vertical",
    props: {
      style: { width: '100%' },
      children: [
        { type: "Radio", props: { key: 'horizontal', value: "horizontal", children: "同行" } },
        { type: "Radio", props: { key: 'vertical', value: "vertical", children: "单独一行" } }
      ]
    }
  },
  labelWidth: {
    label: '标签宽度',
    type: 'SliderNumber',
    initialValue: 120,
    props: {
      min: 0,
      max: 300
    }
  },
  required: {
    type: 'Checkbox',
    valueProp: 'checked',
    initialValue: false,
    props: {
      children: '标签必填标志'
    }
  },
  suffix: {
    label: '后缀',
    type: 'Input'
  },
  footer: {
    label: '描述',
    type: 'Input'
  }
}
