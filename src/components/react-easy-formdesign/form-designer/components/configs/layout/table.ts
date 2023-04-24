export default {
  id: 'table',
  componentLabel: '表格布局',
  component: null,
  type: 'Table',
  ignore: true,
  properties: [
    {
      component: null,
      type: 'Table.Row',
      properties: {
        td1: {
          component: null,
          type: 'Table.Cell',
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
          component: null,
          type: 'Table.Cell',
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
