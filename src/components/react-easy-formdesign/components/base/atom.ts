import { ElementsType } from ".."

// 表单原子控件
const elements = {
  input: {
    label: '输入框',
    type: 'Input',
    outside: { type: 'col', props: { span: 12 } },
    settings: {
      type: {
        label: "输入框类型",
        type: "Select",
        initialValue: "Input",
        props: {
          style: { width: '100%' },
          children: [
            { type: "Select.Option", props: { key: 'Input', value: "Input", children: "单行输入" } },
            { type: "Select.Option", props: { key: 'Input.TextArea', value: "Input.TextArea", children: "多行输入" } },
            { type: "Select.Option", props: { key: 'InputNumber', value: "InputNumber", children: "数字输入" } },
            { type: "Select.Option", props: { key: 'Input.Password', value: "Input.Password", children: "密码输入" } }
          ]
        }
      },
      initialValue: {
        label: '默认值',
        type: 'Input'
      }
    }
  }
}

export default ['atomElements', elements] as [string, ElementsType]

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