// 组件公共配置项
export const commonSettings = {
  label: {
    label: '标签名称',
    widget: 'Input'
  },
  col: {
    label: '标签布局',
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
  layout: {
    label: "标签展示模式",
    widget: "Radio.Group",
    initialValue: "vertical",
    widgetProps: {
      style: { width: '100%' },
      children: [
        { widget: "Radio", widgetProps: { key: 'horizontal', value: "horizontal", children: "同行" } },
        { widget: "Radio", widgetProps: { key: 'vertical', value: "vertical", children: "单独一行" } }
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
  required: {
    widget: 'Checkbox',
    valueProp: 'checked',
    initialValue: false,
    widgetProps: {
      children: '标签必填标志'
    }
  },
  suffix: {
    label: '后缀',
    widget: 'Input'
  },
  footer: {
    label: '描述',
    widget: 'Input'
  }
}

// 字段名的配置项
export const nameSettings = {
  name: {
    label: '字段名',
    widget: 'Input'
  }
}