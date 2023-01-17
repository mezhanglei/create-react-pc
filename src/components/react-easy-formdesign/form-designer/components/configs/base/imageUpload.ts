import {
  disabled,
} from "./common";

export default {
  id: 'imageupload',
  label: '图片上传',
  type: 'ImageUpload',
  dataType: 'ignore',
  props: {
  },
  settings: {
    props: {
      compact: true,
      properties: {
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
