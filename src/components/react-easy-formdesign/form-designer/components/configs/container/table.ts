export default {
  id: 'formTable',
  componentLabel: '表格组件',
  label: '表格组件',
  type: 'FormTable',
  props: {
    dataSource: [],
    columns: [{
      id: 'formTableColumn',
      name: 'col1',
      label: "第一列",
      type: 'Input'
    }]
  }
}
