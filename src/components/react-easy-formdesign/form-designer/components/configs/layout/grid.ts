export default {
  id: 'GridRow',
  icon: 'grid',
  componentLabel: '栅格布局',
  ignore: true,
  component: null,
  type: 'Grid.Row',
  includes: ['GridCol'],
  properties: {
    col1: {
      id: 'GridCol',
      component: null,
      type: 'Grid.Col',
      props: { span: 12 },
      ignore: true,
      properties: {
      }
    },
    col2: {
      id: 'GridCol',
      component: null,
      type: 'Grid.Col',
      props: { span: 12 },
      ignore: true,
      properties: {
      }
    },
  }
}
