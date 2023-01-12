/**
 * 通用的配置属性集合
 */

export const initialValue = {
  label: '默认值',
  type: 'CodeTextArea'
}

export const disabled = {
  label: '禁用',
  type: 'Switch',
  valueProp: 'checked',
}

export const allowClear = {
  label: '是否可以清除',
  type: 'Switch',
  valueProp: 'checked',
  initialValue: true
}

export const size = {
  label: "尺寸",
  type: "Radio.Group",
  initialValue: 'middle',
  props: {
    style: { width: '100%' },
    options: [
      { label: '大', value: 'large' },
      { label: '中', value: 'middle' },
      { label: '小', value: 'small' }
    ]
  }
}

export const maxLength = {
  label: '最大输入字符数',
  type: 'InputNumber',
  initialValue: 30
}

export const placeholder = {
  label: '占位字符',
  type: 'Input',
  initialValue: '请输入'
}
