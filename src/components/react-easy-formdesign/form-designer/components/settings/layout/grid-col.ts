const settings = {
  props: {
    compact: true,
    properties: {
      span: {
        label: '栅格占位格数',
        type: 'Slider',
        initialValue: 12,
        props: {
          style: { width: '100%' },
          max: 24
        }
      },
      offset: {
        label: '栅格左侧间隔格数',
        type: 'Slider',
        props: {
          style: { width: '100%' },
          max: 24
        }
      },
      pull: {
        label: '栅格向左移动格数',
        type: 'Slider',
        props: {
          style: { width: '100%' },
          max: 24
        }
      },
      push: {
        label: '栅格向右移动格数',
        type: 'Slider',
        props: {
          style: { width: '100%' },
          max: 24
        }
      },
    }
  }
}

export default ['基础属性', settings] as [string, typeof settings]
