const baseSettings = {
  dataIndex: {
    label: '字段名',
    type: 'Input'
  },
  label: {
    label: '标题',
    type: 'Input'
  },
  width: {
    label: '列宽',
    type: 'InputNumber',
    props: {
      min: 0,
      max: 300
    }
  },
  align: {
    label: '对齐方式',
    type: "Select",
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
}

const settings = {
  '列属性': baseSettings,
}

export default settings;
