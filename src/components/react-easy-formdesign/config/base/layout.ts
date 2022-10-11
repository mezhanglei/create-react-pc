export const layoutElements = [{
  prefix: 'object',
  label: '对象容器',
  inside: { type: 'row' },
  properties: {
  },
  settings: {
  }
}, {
  prefix: 'list',
  label: '数组容器',
  inside: { type: 'row' },
  properties: [
  ],
  settings: {
  }
}, {
  prefix: 'table',
  label: '表格',
  inside: { type: 'row' },
  properties: [
    {
      prefix: 'row',
      properties: {
        col1: {
          type: 'Input',
          outside: { type: 'col', props: { span: 6 } }
        },
        col2: {
          type: 'Input',
          outside: { type: 'col', props: { span: 6 } }
        }
      }
    }
  ],
  settings: {
  }
}]
