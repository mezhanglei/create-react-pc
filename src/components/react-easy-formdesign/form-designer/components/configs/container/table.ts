export default {
  id: 'FormTable',
  icon: 'table',
  componentLabel: '表格组件',
  label: '表格组件',
  type: 'FormTable',
  props: {
    showBtn: true,
    columns: [{
      id: "FormTableCol",
      subId: 'Input',
      label: 'ss',
      name: 'ss',
      type: 'Input',
      initialValue: 1,
    }, {
      id: "FormTableCol",
      subId: 'Input',
      name: 'dd',
      type: 'Input',
      label: 'dd'
    }]
  }
}
