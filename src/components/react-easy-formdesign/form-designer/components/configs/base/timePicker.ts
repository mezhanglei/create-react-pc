
export default {
  id: 'timePicker',
  icon: 'time-field',
  componentLabel: '时间选择器',
  label: '时间选择器',
  type: 'TimePicker',
  valueSetter: "{{(value)=> (value && moment(value, formvalues.props && formvalues.props.format || 'HH:mm:ss' ))}}",
  valueGetter: "{{(value) => (value && moment(value).format(formvalues.props && formvalues.props.format || 'HH:mm:ss'))}}",
  props: {
  },
}
