const settings = {
  "inside.props": {
    compact: true,
    properties: {
      gutter: {
        label: '栅格间隔',
        type: 'InputNumber',
        valueGetter: "{{((val) => val || 0)}}"
      },
      justify: {
        label: "水平排列",
        type: "Select",
        initialValue: 'start',
        props: {
          style: { width: '100%' },
          options: [
            { label: '从头开始', value: 'start' },
            { label: '从尾部开始', value: 'end' },
            { label: '居中排列', value: 'center' },
            { label: '均匀分布(中间间隔相等)', value: 'space-around' },
            { label: '居中均匀分布', value: 'space-between' },
            { label: '均匀分布(每个间隔相等)', value: 'space-evenly' },
          ]
        }
      },
      align: {
        label: "垂直对齐",
        type: "Select",
        initialValue: 'top',
        props: {
          style: { width: '100%' },
          options: [
            { label: '顶部对齐', value: 'top' },
            { label: '居中', value: 'middle' },
            { label: '底部对齐', value: 'bottom' },
          ]
        }
      },
    }
  }
}

export default ['基础属性', settings] as [string, typeof settings]
