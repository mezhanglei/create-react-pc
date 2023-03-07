export default {
  id: 'grid',
  label: '栅格布局',
  outside: { type: 'Row', props: {} },
  fieldComponent: null,
  ignore: true,
  properties: {
    col: {
      outside: { type: 'Col', props: {} },
      fieldComponent: null,
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
