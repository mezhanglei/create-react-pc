// 全局配置项
export const globalSettings = {
  labelWidth: {
    label: '标签宽度',
    type: 'SliderNumber',
    initialValue: 120,
    props: {
      min: 0,
      max: 300
    }
  },
  layout: {
    label: "标签展示模式",
    type: "Radio.Group",
    initialValue: "vertical",
    props: {
      style: { width: '100%' },
      children: [
        { type: "Radio", props: { value: "vertical", children: "同行" } },
        { type: "Radio", props: { value: "horizontal", children: "单独一行" } }
      ]
    }
  }
}