import {
  disabled,
  initialValue
} from "./common";

export default {
  id: 'cascader',
  label: '级联选择器',
  type: 'Cascader',
  props: {
    options: [
      {
        value: 'zhejiang',
        label: 'Zhejiang',
        children: [
          {
            value: 'hangzhou',
            label: 'Hangzhou',
            children: [
              {
                value: 'xihu',
                label: 'West Lake',
              },
            ],
          },
        ],
      },
      {
        value: 'jiangsu',
        label: 'Jiangsu',
        children: [
          {
            value: 'nanjing',
            label: 'Nanjing',
            children: [
              {
                value: 'zhonghuamen',
                label: 'Zhong Hua Men',
              },
            ],
          },
        ],
      },
    ]
  },
  settings: {
    initialValue: initialValue,
    props: {
      compact: true,
      properties: {
        options: {
          type: 'OptionsComponent',
          label: '选项数据',
          props: {
            includes: ['json', 'request']
          }
        },
        disabled: disabled,
      }
    }
  },
}
