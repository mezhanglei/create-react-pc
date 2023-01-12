import {
  disabled,
} from "./common";

export default {
  id: 'imageupload',
  label: '图片上传',
  type: 'ImageUpload',
  props: {
  },
  settings: {
    props: {
      compact: true,
      properties: {
        autoUpload: {
          label: '是否在选取文件后立即上传',
          type: 'Switch',
          valueProp: 'checked',
          initialValue: true
        },
        action: {
          label: '上传路径',
          type: 'Input',
          hidden: "{{$formvalues.props.autoUpload != true}}"
        },
        headers: {
          label: '上传头部信息',
          type: "CodeTextArea",
          hidden: "{{$formvalues.props.autoUpload != true}}"
        },
        name: {
          label: '上传字段名',
          type: 'Input',
          initialValue: 'files[]',
          hidden: "{{$formvalues.props.autoUpload != true}}"
        },
        data: {
          label: '上传额外参数',
          type: "CodeTextArea",
          hidden: "{{$formvalues.props.autoUpload != true}}"
        },
        multiple: {
          label: '是否支持多选',
          type: 'Switch',
          valueProp: 'checked',
        },
        maxCount: {
          label: '最大允许上传个数',
          type: 'InputNumber',
          initialValue: 5
        },
        fileSizeLimit: {
          label: '文件大小限制(MB)',
          type: 'InputNumber',
          initialValue: 5
        },
        disabled: disabled,
      }
    }
  },
}
