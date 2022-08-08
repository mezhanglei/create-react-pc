// 表单全局配置项
export const globalSettings = {
  col: {
    label: '整体布局',
    type: 'Select',
    initialValue: { span: 12 },
    valueSetter: "{{(value)=> (value && value['span'])}}",
    valueGetter: "{{(value) => ({span: value})}}",
    props: {
      style: { width: '100%' },
      children: [
        { type: 'Select.Option', props: { key: 1, value: 12, children: '一行一列' } },
        { type: 'Select.Option', props: { key: 2, value: 6, children: '一行二列' } },
        { type: 'Select.Option', props: { key: 3, value: 4, children: '一行三列' } }
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