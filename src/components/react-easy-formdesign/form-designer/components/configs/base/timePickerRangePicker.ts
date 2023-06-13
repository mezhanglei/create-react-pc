
export default {
  id: 'TimePickerRangePicker',
  icon: 'time-field',
  componentLabel: '时间范围',
  label: '时间范围',
  type: 'TimePicker.RangePicker',
  valueSetter: "{{(value) => typeof value === 'string' && moment(value, 'HH:mm:ss')}}",
  valueGetter: "{{(value) => moment.isMoment(value) && value.format(formvalues.props && formvalues.props.format || 'HH:mm:ss')}}",
  props: {
  },
}
