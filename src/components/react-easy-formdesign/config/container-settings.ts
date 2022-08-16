// 容器的配置项(暂未使用)
export const containerSettings = {
  outside: {
    label: '栅格布局',
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
  },
}
