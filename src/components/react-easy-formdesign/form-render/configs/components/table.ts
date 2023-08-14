export default {
  configIcon: 'table',
  configLabel: '表格布局',
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
              type: 'Input',
              props: {}
            }
          }
        },
      }
    },
  ],
}
