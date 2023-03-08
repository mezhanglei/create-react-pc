export default {
  id: 'grid',
  label: '栅格布局',
  outside: { type: 'Grid.Row', props: {} },
  component: null,
  ignore: true,
  properties: {
    col: {
      outside: { type: 'Grid.Col', props: {} },
      component: null,
      ignore: true,
      properties: {
        name1: {
          id: 'input',
          type: 'Input',
          props: {}
        }
      }
    }
  }
}
