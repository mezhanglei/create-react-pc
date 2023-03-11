export default {
  id: 'row',
  label: '栅格布局',
  inside: { type: 'Grid.Row', props: {} },
  component: null,
  ignore: true,
  includes: ['col'],
  properties: {
    col1: {
      id: 'col',
      inside: { type: 'Grid.Col', props: { span: 12 } },
      component: null,
      ignore: true,
      properties: {
      }
    },
    col2: {
      id: 'col',
      inside: { type: 'Grid.Col', props: { span: 12 } },
      component: null,
      ignore: true,
      properties: {
      }
    },
  }
}
