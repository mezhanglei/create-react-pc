export default {
  id: 'Table',
  icon: 'table',
  componentLabel: '表格布局',
  type: 'Table',
  ignore: true,
  properties: [
    {
      type: 'Table.Row',
      properties: {
        td1: {
          type: 'Table.Cell',
          ignore: true,
          properties: {
            name1: {
              id: 'Input',
              type: 'Input',
              props: {}
            }
          }
        },
        td2: {
          type: 'Table.Cell',
          ignore: true,
          properties: {
            name2: {
              id: 'Input',
              type: 'Input',
              props: {}
            }
          }
        },
      }
    },
  ],
}
