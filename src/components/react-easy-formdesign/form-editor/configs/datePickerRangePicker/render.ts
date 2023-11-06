
export default {
  configInfo: {
    icon: 'date-field',
    label: '日期范围',
  },
  label: '日期范围',
  valueSetter: "{{(value)=> value instanceof Array && value.map((item) => typeof item === 'string' && moment(item))}}",
  valueGetter: "{{(value) => value instanceof Array && value.map((item) => moment.isMoment(item) && moment(item).format(formvalues.props && formvalues.props.format || 'YYYY-MM-DD'))}}",
  type: 'DatePicker.RangePicker',
  props: {
  },
}
