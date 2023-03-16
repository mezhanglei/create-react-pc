export default {
  id: 'table',
  componentLabel: '表格布局',
  inside: { type: 'Table', props: {} },
  component: null,
  ignore: true,
  properties: [
    {
      inside: { type: 'Table.Row', props: {} },
      component: null,
      properties: {
        td1: {
          inside: { type: 'Table.Cell', props: {} },
          component: null,
          ignore: true,
          properties: {
            name1: {
              id: 'input',
              type: 'Input',
              props: {}
            }
          }
        },
        td2: {
          inside: { type: 'Table.Cell', props: {} },
          component: null,
          ignore: true,
          properties: {
            name2: {
              id: 'input',
              type: 'Input',
              props: {}
            }
          }
        },
      }
    },
  ],
}
