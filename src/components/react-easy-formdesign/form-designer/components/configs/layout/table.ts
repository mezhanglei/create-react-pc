export default {
  id: 'table',
  label: '表格布局',
  fieldComponent: { type: 'Table', props: {} },
  ignore: true,
  properties: [
    {
      fieldComponent: { type: 'Table.Row', props: {} },
      properties: {
        td1: {
          fieldComponent: { type: 'Table.Cell', props: {} },
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
          fieldComponent: { type: 'Table.Cell', props: {} },
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
    // {
    //   fieldComponent: { type: 'Table.Row', props: {} },
    //   properties: {
    //     td1: {
    //       fieldComponent: { type: 'Table.Cell', props: {} },
    //       properties: {
    //         name1: {
    //           id: 'input',
    //           type: 'Input',
    //           props: {}
    //         }
    //       }
    //     },
    //     td2: {
    //       fieldComponent: { type: 'Table.Cell', props: {} },
    //       properties: {
    //         name2: {
    //           id: 'input',
    //           type: 'Input',
    //           props: {}
    //         }
    //       }
    //     },
    //   }
    // },
  ],
}
