export default {
  id: 'Grid.Row',
  icon: 'grid',
  componentLabel: '栅格布局',
  ignore: true,
  component: null,
  type: 'Grid.Row',
  includes: ['col'],
  properties: {
    col1: {
      id: 'Grid.Col',
      component: null,
      type: 'Grid.Col',
      props: { span: 12 },
      ignore: true,
      properties: {
      }
    },
    col2: {
      id: 'Grid.Col',
      component: null,
      type: 'Grid.Col',
      props: { span: 12 },
      ignore: true,
      properties: {
      }
    },
  }
}
