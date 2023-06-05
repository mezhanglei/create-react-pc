import {
  Input,
  InputNumber,
  Checkbox,
  DatePicker,
  Mentions,
  Radio,
  Rate,
  Select,
  Slider,
  Switch,
  TimePicker,
  Cascader,
  Alert,
  Divider,
} from 'antd';
import CodeInput from './code-input';
import CodeTextArea from './code-textarea';
import ColorPicker from './color-picker';
import OptionsComponent from './options';
import { SliderNumber } from './slider-number';
import FileUpload from "./file-upload";
import ImageUpload from "./image-upload";
import { bindRequest } from './options/bind';
import RulesComponent from './rules';
import { LinkageCheckbox } from './linkage';
import { EditorCodeMirror } from './options/editor';
import RichEditor, { RichEditorModalBtn } from './rich-editor';
import { RichText } from './rich-text';
import FormTable from './form-table';
import Collapse from './collapse';
import Table, { TableBody, TableCell, TableHead, TableRow } from './layout-table';
import { GridCol } from './grid/col';
import { GridRow } from './grid/row';

// 提供开发过程中的基础组件
export const BaseComponents = {
  // ui库组件
  "Input": Input, // 输入控件
  "Input.TextArea": Input.TextArea, // 输入文本域
  "Input.Password": Input.Password, // 输入密码组件
  "Input.Search": Input.Search, // 输入搜索组件
  "InputNumber": InputNumber, // 数字输入控件
  "SliderNumber": SliderNumber, // 带数字输入框的控件
  "Mentions": Mentions, // 携带@提示的输入控件
  "Mentions.Option": Mentions.Option, // 提示控件的option
  "Checkbox": Checkbox, // 多选组件
  'Checkbox.Group': bindRequest(Checkbox.Group), // 多选列表组件
  "Radio": Radio, // 单选组件
  "Radio.Group": bindRequest(Radio.Group), // 单选列表组件
  "Radio.Button": Radio.Button, // 单选按钮组件
  "DatePicker": DatePicker, // 日期控件
  "DatePicker.RangePicker": DatePicker.RangePicker, // 日期范围控件
  "Rate": Rate, // 星星评分控件
  "Select": bindRequest(Select), // 选择控件
  "Select.Option": Select.Option, // 选择的选项
  "Slider": Slider, // 滑动输入项
  "Switch": Switch, // 切换组件
  "TimePicker": TimePicker, // 时分秒控件
  "TimePicker.RangePicker": TimePicker.RangePicker, // 时分秒范围控件
  "Cascader": bindRequest(Cascader),
  "Alert": Alert, // 提示组件
  "Divider": Divider, // 分割线组件
  // 自定义组件
  "OptionsComponent": OptionsComponent, // 用于显示数据源的控件
  "RulesComponent": RulesComponent, // 添加校验规则的控件
  "CodeInput": CodeInput, // 值的输入框
  "CodeTextArea": CodeTextArea, // 值的输入框(支持函数)
  "EditorCodeMirror": EditorCodeMirror, // 值的输入框(不支持函数)
  "ColorPicker": ColorPicker, // 颜色选择器
  "FileUpload": FileUpload, // 文件上传
  "ImageUpload": ImageUpload, // 图片上传
  "LinkageCheckbox": LinkageCheckbox, // 携带联动设置的checkbox
  "RichEditor": RichEditor, // 富文本编辑器
  "RichText": RichText, // 富文本展示
  "RichEditorModalBtn": RichEditorModalBtn, // 富文本编辑器按钮弹窗
  "FormTable": FormTable, // 可编辑表格
  "Collapse": Collapse,
  "Table": Table,
  "Table.Cell": TableCell,
  "Table.Row": TableRow,
  "Table.Head": TableHead,
  "Table.Body": TableBody,
  "Grid.Row": GridRow,
  "Grid.Col": GridCol,
}
