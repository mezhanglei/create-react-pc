const baseSettings = {
  initialValue: {
    label: '默认值',
    type: 'RichEditorModalBtn',
  },
}

const operationSettings = {
  hidden: {
    type: 'LinkageCheckbox',
    inline: true,
    props: { children: '隐藏' }
  },
}

const settings = {
  '基础属性': baseSettings,
  '操作属性': operationSettings,
}

export default settings;
