export default {
  id: 'table',
  label: '表格布局',
  component: { type: 'Table', props: {} },
  ignore: true,
  properties: [
    {
      component: { type: 'Table.Row', props: {} },
      properties: {
        td1: {
          component: { type: 'Table.Cell', props: {} },
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
          component: { type: 'Table.Cell', props: {} },
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
    //   component: { type: 'Table.Row', props: {} },
    //   properties: {
    //     td1: {
    //       component: { type: 'Table.Cell', props: {} },
    //       properties: {
    //         name1: {
    //           id: 'input',
    //           type: 'Input',
    //           props: {}
    //         }
    //       }
    //     },
    //     td2: {
    //       component: { type: 'Table.Cell', props: {} },
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
