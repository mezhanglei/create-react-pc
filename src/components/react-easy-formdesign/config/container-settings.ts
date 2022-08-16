// 容器类型和对应的属性设置
const containerMap = {
  col: {
    label: '栅格列',
    type: 'Select',
    initialValue: { type: 'col', props: { span: 12 } },
    valueSetter: "{{(value)=> (value && value['props']['span'])}}",
    valueGetter: "{{(value) => ({ type: 'col', props: { span: value } })}}",
    props: {
      style: { width: '100%' },
      children: [
        { type: 'Select.Option', props: { key: 1, value: 12, children: '一行一列' } },
        { type: 'Select.Option', props: { key: 2, value: 6, children: '一行二列' } },
        { type: 'Select.Option', props: { key: 3, value: 4, children: '一行三列' } }
      ]
    }
  }
}

// 根据容器组件的类型返回对应容器的配置项
export const getContainerSettings = (container: 'row' | 'col' | string) => {
  return container && containerMap[container]
}
