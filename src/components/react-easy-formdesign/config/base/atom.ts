// 表单原子控件
export const atomElements = {
  input: {
    label: '输入框',
    widget: 'Input',
    settings: {
      widget: {
        label: "输入框类型",
        widget: "Select",
        initialValue: "Input",
        widgetProps: {
          style: { width: '100%' },
          children: [
            { widget: "Select.Option", widgetProps: { key: 'Input', value: "Input", children: "单行输入" } },
            { widget: "Select.Option", widgetProps: { key: 'Input.TextArea', value: "Input.TextArea", children: "多行输入" } },
            { widget: "Select.Option", widgetProps: { key: 'InputNumber', value: "InputNumber", children: "数字输入" } },
            { widget: "Select.Option", widgetProps: { key: 'Input.Password', value: "Input.Password", children: "密码输入" } }
          ]
        }
      },
      initialValue: {
        label: '默认值',
        widget: 'Input'
      }
    }
  }
}

// import 'codemirror/lib/codemirror.css';
// import CodeMirror from 'codemirror/lib/codemirror';
// import 'codemirror/mode/javascript/javascript';
// this.editor = CodeMirror(this.$refs.editor, {
//   lineNumbers: true,
//   mode: 'javascript',
//   gutters: ['CodeMirror-lint-markers'],
//   lint: true,
//   line: true,
//   tabSize: 2,
//   lineWrapping: true,
//   value: val || ''
// });