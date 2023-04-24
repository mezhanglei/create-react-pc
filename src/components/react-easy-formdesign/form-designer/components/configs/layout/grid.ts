export default {
  id: 'row',
  componentLabel: '栅格布局',
  // inside: { type: 'Grid.Row', props: {} },
  // component: null,
  ignore: true,
  type: 'Grid.Row',
  includes: ['col'],
  properties: {
    col1: {
      id: 'col',
      type: 'Grid.Col',
      // inside: { type: 'Grid.Col', props: { span: 12 } },
      component: null,
      ignore: true,
      properties: {
      }
    },
    col2: {
      id: 'col',
      type: 'Grid.Col',
      // inside: { type: 'Grid.Col', props: { span: 12 } },
      // component: null,
      ignore: true,
      properties: {
      }
    },
  }
}
