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
import CodeInput from './base/CodeInput';
import CodeTextArea from './base/CodeTextarea';
import ColorPicker from './base/ColorPicker';
import OptionsComponent from './base/options';
import { SliderNumber } from './base/SliderNumber';
import { bindRequest } from './base/options/bind';
import RulesComponent from './base/rules';
import { LinkageCheckbox } from './base/linkage';
import { EditorCodeMirror } from './base/CodeMirror';
import RichEditor, { RichEditorModalBtn } from './base/RichEditor';
import { RichText } from './base/RichText';
import FormTable from './base/FormTable';
import Collapse from './base/Collapse';
import Table, { TableBody, TableCell, TableHead, TableRow } from './base/LayoutTable';
import FileUpload from '@/components/FileUpload';
import ImageUpload from '@/components/ImageUpload';
import GroupExample from './groups/example';
import { GridCol, GridRow } from './base/grid';
import { CustomOptions, FormNodeProps } from '..';

export interface ELementProps extends FormNodeProps, CustomOptions {
  includes?: string[]; // 子元素限制可以添加的组件类型
  configLabel?: string; // 配置组件的名
  configIcon?: string; // 配置组件的图标
  properties?: { [name: string]: ELementProps } | ELementProps[] // 子元素渲染树
}

// 注册组件
export const registerComponents = {
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
  "TableCell": TableCell,
  "TableRow": TableRow,
  "TableHead": TableHead,
  "TableBody": TableBody,
  "GridRow": GridRow,
  "GridCol": GridCol,
  "example": GroupExample,
}
