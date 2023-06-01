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
      key: 'ss',
      name: 'ss',
      type: 'Input',
      label: 'ss'
    }, {
      id: "FormTableCol",
      subId: 'Input',
      key: 'dd',
      name: 'dd',
      type: 'Input',
      label: 'dd'
    }]
  }
}
