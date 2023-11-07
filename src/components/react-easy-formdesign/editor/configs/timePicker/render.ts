
export default {
  configInfo: {
    icon: 'time-field',
    label: '时间选择器',
  },
  label: '时间选择器',
  type: 'TimePicker',
  valueSetter: "{{(value) => typeof value === 'string' && moment(value, 'HH:mm:ss')}}",
  valueGetter: "{{(value) => moment.isMoment(value) && value.format(formvalues.props && formvalues.props.format || 'HH:mm:ss')}}",
  props: {

  },
}
