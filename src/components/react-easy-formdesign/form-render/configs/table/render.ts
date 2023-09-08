export default {
  configIcon: 'table',
  configLabel: '表格布局',
  type: 'Table',
  ignore: true,
  properties: [
    {
      type: 'TableRow',
      properties: {
        td1: {
          type: 'TableCell',
          ignore: true,
          properties: {
            name1: {
              type: 'Input',
              props: {}
            }
          }
        },
        td2: {
          type: 'TableCell',
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
