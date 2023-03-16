const settings = {
  initialValue: {
    label: '默认值',
    type: 'RichEditorModalBtn',
  },
}

export default ['基础属性', settings] as [string, typeof settings]

const operationSettings = {
  hidden: {
    type: 'LinkageCheckbox',
    inline: true,
    props: { children: '隐藏' }
  },
}

export const richText_operation = ['操作属性', operationSettings] as [string, typeof operationSettings]