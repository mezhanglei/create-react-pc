export default {
  configIcon: 'grid',
  configLabel: '栅格布局',
  ignore: true,
  type: 'Grid.Row',
  includes: ['Grid.Col'],
  properties: {
    col1: {
      type: 'Grid.Col',
      props: { span: 12 },
      ignore: true,
      properties: {
      }
    },
    col2: {
      type: 'Grid.Col',
      props: { span: 12 },
      ignore: true,
      properties: {
      }
    },
  }
}
