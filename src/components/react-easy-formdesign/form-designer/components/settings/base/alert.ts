const settings = {
  // === 控件自身的props的设置
  props: {
    compact: true,
    properties: {
      message: {
        label: '提示',
        type: 'Input',
      },
      description: {
        label: '提示描述',
        type: 'Input',
      },
      type: {
        label: "样式",
        type: "Radio.Group",
        initialValue: 'success',
        props: {
          style: { width: '100%' },
          options: [
            { label: 'success', value: 'success' },
            { label: 'info', value: 'info' },
            { label: 'warning', value: 'warning' },
            { label: 'error', value: 'error' },
          ]
        }
      },
    }
  }
}

export default ['基础属性', settings] as [string, typeof settings]

const operationSettings = {
  hidden: {
    type: 'LinkageCheckbox',
    inline: true,
    props: { children: '隐藏' }
  },
  props: {
    compact: true,
    inline: true,
    fieldComponent: null,
    properties: {
      showIcon: {
        type: 'Checkbox',
        inline: true,
        props: { children: '显示图标' }
      },
      closable: {
        type: 'Checkbox',
        inline: true,
        props: { children: '可关闭' }
      },
    }
  }
}

export const alert_operation = ['操作属性', operationSettings] as [string, typeof operationSettings]