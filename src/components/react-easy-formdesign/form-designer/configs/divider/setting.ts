const baseSetting = {
  // === 控件自身的props的设置
  props: {
    properties: {
      children: {
        label: '标题',
        type: 'Input',
      },
      orientation: {
        label: "位置",
        type: "Radio.Group",
        props: {
          style: { width: '100%' },
          options: [
            { label: '左边对齐', value: 'left' },
            { label: '居中', value: 'center' },
            { label: '右边对齐', value: 'right' },
          ]
        }
      },
      type: {
        label: "位置",
        type: "Radio.Group",
        props: {
          style: { width: '100%' },
          options: [
            { label: '水平', value: 'horizontal' },
            { label: '垂直', value: 'vertical' },
          ]
        }
      }
    }
  }
}

const operationSetting = {
  hidden: {
    type: 'DynamicSetting',
    inline: true,
    compact: true,
    props: { children: '隐藏' }
  },
  props: {
    properties: {
      plain: {
        type: 'Checkbox',
        inline: true,
        compact: true,
        props: { children: '正文样式' }
      },
      dashed: {
        type: 'Checkbox',
        inline: true,
        compact: true,
        props: { children: '是否虚线' }
      },
    }
  }
}

const setting = {
  '基础属性': baseSetting,
  '操作属性': operationSetting,
}

export default setting;
