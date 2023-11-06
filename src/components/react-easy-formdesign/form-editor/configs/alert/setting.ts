const baseSetting = {
  // === 控件自身的props的设置
  props: {
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

const operationSetting = {
  hidden: {
    type: 'DynamicSettingCheckbox',
    inline: true,
    compact: true,
    props: { children: '隐藏' }
  },
  props: {
    properties: {
      showIcon: {
        type: 'Checkbox',
        inline: true,
        compact: true,
        props: { children: '显示图标' }
      },
      closable: {
        type: 'Checkbox',
        inline: true,
        compact: true,
        props: { children: '可关闭' }
      },
    }
  }
}

const setting = {
  '基础属性': baseSetting,
  '操作属性': operationSetting,
}

export default setting;
