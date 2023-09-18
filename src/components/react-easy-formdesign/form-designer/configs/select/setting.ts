const baseSetting = {
  initialValue: {
    label: '默认值',
    type: 'CodeTextArea',
  },
  props: {
    properties: {
      placeholder: {
        label: '占位字符',
        type: 'Input',
        initialValue: '请输入'
      },
      options: {
        type: 'SetOptions',
        label: '选项数据',
        props: {
        }
      },
      mode: {
        label: '选择模式',
        type: "Select",
        props: {
          style: { width: '100%' },
          allowClear: true,
          options: [
            { label: '多选', value: 'multiple' },
            { label: '标签', value: 'tags' }
          ]
        }
      },
      maxTagCount: {
        label: '标签最大数量',
        type: 'InputNumber',
        hidden: "{{formvalues && formvalues.props && formvalues.props.mode !== 'tags'}}",
        initialValue: 10
      },
      size: {
        label: "尺寸",
        type: "Radio.Group",
        initialValue: 'middle',
        props: {
          style: { width: '100%' },
          options: [
            { label: '大', value: 'large' },
            { label: '中', value: 'middle' },
            { label: '小', value: 'small' }
          ]
        }
      },
    }
  }
}

const operationSetting = {
  hidden: {
    type: 'DynamicSetting',
    inline: true,
    compact: true,
    props: { children: '隐藏' }
  },
  props: {
    properties: {
      disabled: {
        type: 'DynamicSetting',
        inline: true,
        compact: true,
        props: { children: '禁用' }
      },
      allowClear: {
        type: 'DynamicSetting',
        inline: true,
        compact: true,
        props: { children: '可清除' }
      },
      showSearch: {
        type: 'DynamicSetting',
        inline: true,
        compact: true,
        props: { children: '可搜索' }
      },
    }
  }
}

const rulesSetting = {
  rules: {
    type: 'RulesComponent',
    compact: true,
    props: {
      includes: ['required'],
    }
  },
}

const setting = {
  '基础属性': baseSetting,
  '操作属性': operationSetting,
  '校验规则': rulesSetting,
}

export default setting;
