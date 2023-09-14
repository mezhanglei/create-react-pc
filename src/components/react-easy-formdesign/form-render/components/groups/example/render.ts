
export default {
  "FormTable_fIEU_3": {
    "props": {
      "minRows": 0,
      "maxRows": 50,
      "showBtn": true,
      "columns": [{
        "type": "Input",
        "props": {
          "placeholder": "请输入",
          "maxLength": 30,
          "size": "middle"
        },
        "layout": "horizontal",
        "labelAlign": "right",
        "labelWidth": 120,
        "colon": false,
        "configIcon": "text-field",
        "configLabel": "输入框",
        "label": "输入框",
        "title": "输入框",
        "dataIndex": "Input_2gywTT",
        "rules": [{
          "required": true,
          "message": "1231321"
        }]
      }, {
        "props": {
          "placeholder": "请输入",
          "maxTagCount": 10,
          "size": "middle",
          "style": {
            "width": "100%"
          },
          "options": [{
            "label": "选项1",
            "value": "1"
          }, {
            "label": "选项2",
            "value": "2"
          }]
        },
        "layout": "horizontal",
        "labelAlign": "right",
        "labelWidth": 120,
        "colon": false,
        "configIcon": "select-field",
        "configLabel": "下拉框",
        "label": "下拉框",
        "type": "Select",
        "title": "下拉框",
        "dataIndex": "Select_3IjTF0"
      }]
    },
    "layout": "horizontal",
    "labelAlign": "right",
    "labelWidth": 120,
    "colon": false,
    "configIcon": "table",
    "configLabel": "可编辑表格",
    "label": "可编辑表格",
    "type": "FormTable"
  },
  "Select_HzHBty": {
    "props": {
      "placeholder": "请输入",
      "maxTagCount": 10,
      "size": "middle",
      "style": {
        "width": "100%"
      },
      "options": [{
        "label": "sss",
        "value": 1
      }],
      "disabled": false
    },
    "layout": "horizontal",
    "labelAlign": "right",
    "labelWidth": 120,
    "colon": false,
    "configIcon": "select-field",
    "configLabel": "下拉框",
    "label": "下拉框",
    "type": "Select",
    "initialValue": 1,
    "hidden": false,
    "rules": [{
      "required": true,
      "message": "1231321"
    }]
  }
}
