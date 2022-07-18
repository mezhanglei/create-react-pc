// 表单全局配置项
export const globalSettings = {
  col: {
    label: '整体布局',
    widget: 'Select',
    initialValue: { span: 12 },
    valueSetter: "{{(value)=> (value && value['span'])}}",
    valueGetter: "{{(value) => ({span: value})}}",
    widgetProps: {
      style: { width: '100%' },
      children: [
        { widget: 'Select.Option', widgetProps: { key: 1, value: 12, children: '一行一列' } },
        { widget: 'Select.Option', widgetProps: { key: 2, value: 6, children: '一行二列' } },
        { widget: 'Select.Option', widgetProps: { key: 3, value: 4, children: '一行三列' } }
      ]
    }
  },
  labelWidth: {
    label: '标签宽度',
    widget: 'SliderNumber',
    initialValue: 120,
    widgetProps: {
      min: 0,
      max: 300
    }
  },
  layout: {
    label: "标签展示模式",
    widget: "Radio.Group",
    initialValue: "vertical",
    widgetProps: {
      style: { width: '100%' },
      children: [
        { widget: "Radio", widgetProps: { value: "vertical", children: "同行" } },
        { widget: "Radio", widgetProps: { value: "horizontal", children: "单独一行" } }
      ]
    }
  }
}