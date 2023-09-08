export default {
  configIcon: 'grid',
  configLabel: '栅格布局',
  ignore: true,
  type: 'Grid.Row',
  includes: ['GridCol'],
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
