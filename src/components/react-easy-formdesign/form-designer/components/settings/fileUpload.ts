const settings = {
  props: {
    compact: true,
    properties: {
      maxCount: {
        label: '最大允许上传个数',
        type: 'InputNumber',
        initialValue: 5
      },
      fileSizeLimit: {
        label: '文件大小限制(MB)',
        type: 'InputNumber',
        initialValue: 5
      },
      disabled: {
        label: '禁用',
        type: 'Switch',
        valueProp: 'checked',
      },
    }
  }
}

export default ['控件属性', settings] as [string, typeof settings]