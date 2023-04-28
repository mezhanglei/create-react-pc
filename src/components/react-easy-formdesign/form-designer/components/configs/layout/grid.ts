export default {
  id: 'gridRow',
  icon: 'grid',
  componentLabel: '栅格布局',
  ignore: true,
  component: null,
  type: 'Grid.Row',
  includes: ['col'],
  properties: {
    col1: {
      id: 'gridCol',
      component: null,
      type: 'Grid.Col',
      props: { span: 12 },
      ignore: true,
      properties: {
      }
    },
    col2: {
      id: 'gridCol',
      component: null,
      type: 'Grid.Col',
      props: { span: 12 },
      ignore: true,
      properties: {
      }
    },
  }
}
