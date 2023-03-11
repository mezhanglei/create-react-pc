export default {
  id: 'table',
  label: '表格布局',
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
