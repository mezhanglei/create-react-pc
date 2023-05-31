export default {
  id: 'FormTable',
  icon: 'table',
  componentLabel: '表格组件',
  label: '表格组件',
  type: 'FormTable',
  props: {
    columns: [{
      id: "FormTableCol",
      subId: 'Input',
      name: 'ss',
      type: 'Input',
      label: 'ss'
    }, {
      id: "FormTableCol",
      subId: 'Input',
      name: 'dd',
      type: 'Input',
      label: 'dd'
    }]
  }
}
