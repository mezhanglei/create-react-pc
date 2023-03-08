export default {
  id: 'row',
  label: '栅格布局',
  outside: { type: 'Grid.Row', props: {} },
  component: null,
  ignore: true,
  properties: {
    col: {
      id: 'col',
      outside: { type: 'Grid.Col', props: { span: 12 } },
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
