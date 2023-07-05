// 默认的表单域显示组件的属性
const baseSettings = {
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
      options: [
        { key: 'horizontal', value: "horizontal", label: "水平" },
        { key: 'vertical', value: "vertical", label: "垂直" },
      ]
    }
  },
  labelAlign: {
    label: '标签水平排列',
    type: "Select",
    initialValue: 'right',
    props: {
      style: { width: '100%' },
      allowClear: true,
      options: [
        { label: '左边对齐', value: 'left' },
        { label: '居中', value: 'center' },
        { label: '右边对齐', value: 'right' },
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
  }
}

const settings = {
  '公共属性': baseSettings
}

export default settings;
