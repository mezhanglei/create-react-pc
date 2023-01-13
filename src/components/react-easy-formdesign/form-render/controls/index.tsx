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
  Cascader
} from 'antd';
import CodeInput from './code-input';
import CodeTextArea from './code-textarea';
import ColorPicker from './color-picker';
import OptionsComponent from './options';
import { SliderNumber } from './slider-number';
import FileUpload from "./file-upload";
import ImageUpload from "./image-upload";

// 提供开发过程中的基础控件(控件需要满足具有value传参，onChange回调函数的props)
export const BaseControls = {
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
  'Checkbox.Group': Checkbox.Group, // 多选列表组件
  "Radio": Radio, // 单选组件
  "Radio.Group": Radio.Group, // 单选列表组件
  "Radio.Button": Radio.Button, // 单选按钮组件
  "DatePicker": DatePicker, // 日期控件
  "DatePicker.RangePicker": DatePicker.RangePicker, // 日期范围控件
  "Rate": Rate, // 星星评分控件
  "Select": Select, // 选择控件
  "Select.Option": Select.Option, // 选择的选项
  "Slider": Slider, // 滑动输入项
  "Switch": Switch, // 切换组件
  "TimePicker": TimePicker, // 时分秒控件
  "TimePicker.RangePicker": TimePicker.RangePicker, // 时分秒范围控件
  "Cascader": Cascader,
  // 自定义组件
  "OptionsComponent": OptionsComponent, // 用于显示数据源的控件
  "CodeInput": CodeInput, // 值的输入框
  "CodeTextArea": CodeTextArea, // 值的输入框
  "ColorPicker": ColorPicker, // 颜色选择器
  "FileUpload": FileUpload, // 文件上传
  "ImageUpload": ImageUpload, // 图片上传
}