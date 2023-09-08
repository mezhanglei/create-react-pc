
export default {
  "DatePicker_PfAmKK":
  {
    "props": { "placeholder": "请输入", "picker": "date", "format": "YYYY-MM-DD", "size": "middle" },
    "layout": "horizontal",
    "labelAlign": "right",
    "labelWidth": 120,
    "colon": false,
    "configIcon": "date-field",
    "configLabel": "日期选择器",
    "label": "日期选择器",
    "valueSetter": "{{(value)=> (typeof value === 'string' && moment(value))}}",
    "valueGetter": "{{(value) => (moment.isMoment(value) && moment(value).format(formvalues.props && formvalues.props.format || 'YYYY-MM-DD'))}}",
    "type": "DatePicker"
  },
  "TimePicker_1Fb7aJ":
  {
    "props": { "placeholder": "请输入", "format": "HH:mm:ss", "size": "middle", "allowClear": true },
    "layout": "horizontal",
    "labelAlign": "right",
    "labelWidth": 120,
    "colon": false,
    "configIcon": "time-field",
    "configLabel": "时间选择器",
    "label": "时间选择器",
    "type": "TimePicker",
    "valueSetter": "{{(value) => typeof value === 'string' && moment(value, 'HH:mm:ss')}}",
    "valueGetter": "{{(value) => moment.isMoment(value) && value.format(formvalues.props && formvalues.props.format || 'HH:mm:ss')}}"
  },
  "Switch_0ebBlh": {
    "props": { "size": "middle" },
    "layout": "horizontal",
    "labelAlign": "right",
    "labelWidth": 120,
    "colon": false,
    "configIcon": "switch-field",
    "configLabel": "开关",
    "label": "开关",
    "type": "Switch",
    "valueProp": "checked"
  },
  "Select_BqIXGU":
  {
    "props": { "placeholder": "请输入", "maxTagCount": 10, "size": "middle", "style": { "width": "100%" }, "options": [{ "label": "选项1", "value": "1" }, { "label": "选项2", "value": "2" }] },
    "layout": "horizontal",
    "labelAlign": "right",
    "labelWidth": 120,
    "colon": false,
    "configIcon": "select-field",
    "configLabel": "下拉框",
    "label": "下拉框",
    "type": "Select"
  },
  "Input_3yixH0":
  {
    "type": "Input",
    "props": { "placeholder": "请输入", "maxLength": 30, "size": "middle" },
    "layout": "horizontal",
    "labelAlign": "right",
    "labelWidth": 120,
    "colon": false,
    "configIcon": "text-field",
    "configLabel": "输入框",
    "label": "输入框"
  }
}
