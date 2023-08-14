
export default {
  configIcon: 'date-field',
  configLabel: '日期选择器',
  label: '日期选择器',
  valueSetter: "{{(value)=> (typeof value === 'string' && moment(value))}}",
  valueGetter: "{{(value) => (moment.isMoment(value) && moment(value).format(formvalues.props && formvalues.props.format || 'YYYY-MM-DD'))}}",
  type: 'DatePicker',
  props: {
  },
}
