const baseSetting = {
  initialValue: {
    label: '默认值',
    type: 'RichEditorModalBtn',
  },
}

const operationSetting = {
  hidden: {
    type: 'DynamicSetting',
    inline: true,
    compact: true,
    props: { children: '隐藏' }
  },
}

const setting = {
  '基础属性': baseSetting,
  '操作属性': operationSetting,
}

export default setting;
