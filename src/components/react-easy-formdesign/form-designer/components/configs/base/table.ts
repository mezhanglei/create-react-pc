export default {
  id: 'table',
  label: '表格布局',
  properties: [
    {
      fieldComponent: { type: 'Table.Row', props: {} },
      properties: {
        name1: {
          fieldComponent: { type: 'Table.Cell', props: {} },
          type: 'Input',
          props: {}
        },
        name2: {
          fieldComponent: { type: 'Table.Cell', props: {} },
          type: 'Input',
          props: {}
        },
      }
    },
    {
      fieldComponent: { type: 'Table.Row', props: {} },
      properties: {
        name1: {
          fieldComponent: { type: 'Table.Cell', props: {} },
          type: 'Input',
          props: {}
        },
        name2: {
          fieldComponent: { type: 'Table.Cell', props: {} },
          type: 'Input',
          props: {}
        },
      }
    },
  ],
  settings: {

  },
}
