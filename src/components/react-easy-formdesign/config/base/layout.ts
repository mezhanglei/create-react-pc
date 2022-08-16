export const layoutElements = [{
  prefix: 'layout',
  label: '对象容器',
  inside: { type: 'row' },
  // category: 'container',
  properties: {
    outside1: {
      outside: { type: 'col', props: { span: 6 } }
    },
    // outside2: {
    //   outside: { type: 'col', props: { span: 6 } }
    // }
  },
  settings: {
    category: {

    }
  }
}, {
  prefix: 'layout',
  label: '数组容器',
  inside: { type: 'row' },
  // category: 'container',
  properties: [
    // {
    //   outside: { type: 'col', props: { span: 6 } }
    // },
    // {
    //   outside: { type: 'col', props: { span: 6 } }
    // }
  ],
  settings: {
    category: {

    }
  }
}]
