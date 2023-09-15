export default {
  configInfo: {
    icon: 'grid',
    label: '栅格布局',
    includes: ['GridCol'],
  },
  ignore: true,
  type: 'GridRow',
  properties: {
    col1: {
      type: 'GridCol',
      props: { span: 12 },
      ignore: true,
      properties: {
      }
    },
    col2: {
      type: 'GridCol',
      props: { span: 12 },
      ignore: true,
      properties: {
      }
    },
  }
}
