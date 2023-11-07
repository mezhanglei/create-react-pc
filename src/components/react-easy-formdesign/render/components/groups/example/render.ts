export default {
  Switch_TmC6HZ: {
    props: {
      size: "middle"
    },
    layout: "horizontal",
    labelAlign: "right",
    labelWidth: 120,
    colon: false,
    configInfo: {
      icon: "switch-field",
      label: "开关"
    },
    label: "开关",
    type: "Switch",
    valueProp: "checked"
  },
  Select_6F3lh1: {
    props: {
      placeholder: "请输入",
      maxTagCount: 10,
      size: "middle",
      style: {
        width: "100%"
      },
      options: [{
        label: "选项1",
        value: "1"
      }, {
        label: "选项2",
        value: "2"
      }]
    },
    layout: "horizontal",
    labelAlign: "right",
    labelWidth: 120,
    colon: false,
    configInfo: {
      icon: "select-field",
      label: "下拉框"
    },
    label: "下拉框",
    type: "Select"
  },
  Input_7B6CPv: {
    type: "Input",
    props: {
      placeholder: "请输入",
      maxLength: 30,
      size: "middle"
    },
    layout: "horizontal",
    labelAlign: "right",
    labelWidth: 120,
    colon: false,
    configInfo: {
      icon: "text-field",
      label: "输入框"
    },
    label: "输入框"
  }
}