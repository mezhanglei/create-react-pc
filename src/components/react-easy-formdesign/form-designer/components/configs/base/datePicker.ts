
export default {
  id: 'DatePicker',
  icon: 'date-field',
  componentLabel: '日期选择器',
  label: '日期选择器',
  type: 'DatePicker',
  valueSetter: "{{(value)=> (value && moment(value, formvalues.props && formvalues.props.format || 'YYYY-MM-DD' ))}}",
  valueGetter: "{{(value) => (value && moment(value).format(formvalues.props && formvalues.props.format || 'YYYY-MM-DD'))}}",
  props: {
  },
}
