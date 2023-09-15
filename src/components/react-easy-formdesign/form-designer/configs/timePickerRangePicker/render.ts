
export default {
  configInfo: {
    icon: 'time-field',
    label: '时间范围',
  },
  label: '时间范围',
  type: 'TimePicker.RangePicker',
  valueSetter: "{{(value)=> value instanceof Array && value.map((item) => typeof item === 'string' && moment(item, 'HH:mm:ss'))}}",
  valueGetter: "{{(value) => value instanceof Array && value.map((item) => moment.isMoment(item) && item.format(formvalues.props && formvalues.props.format || 'HH:mm:ss'))}}",
  props: {
  },
}
