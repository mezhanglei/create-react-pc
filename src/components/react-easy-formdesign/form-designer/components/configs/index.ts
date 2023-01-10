import { getArrMap } from "@/utils/array";
import { FormFieldProps } from "../../../form-render";
import Input from './input';
import Radio from './radio';
import Checkbox from './checkbox';
import Select from './select';
import Switch from './switch';
import TimePicker from './timePicker';
import DatePicker from './datePicker';
import Slider from './sliderLine';
import Rate from './rate';
import ColorPicker from './colorPicker';
import FileUpload from './fileUpload';
import ImageUpload from './imageUpload';
import table from './table';

// 列表中的元素类型
export interface ELementProps extends FormFieldProps {
  id?: string;
  icon?: string;
  settings?: FormFieldProps['properties']; // 属性配置项
  properties?: { [name: string]: ELementProps } | ELementProps[]
}

export type ElementsType = { [key: string]: ELementProps }

export type FormDesignData = { [key: string]: ELementProps } | ELementProps[]

export const TabsData = [{
  key: 'base',
  tab: '基础组件',
  children: [
    {
      title: '基础控件',
      elementType: '基础控件',
      elements: [
        Input,
        Radio,
        Checkbox,
        Select,
        Switch,
        TimePicker,
        DatePicker,
        Slider,
        Rate,
        ColorPicker,
        FileUpload,
        ImageUpload
      ]
    }
  ]
}, {
  key: 'example',
  tab: '表单模板',
  children: [
    {
      title: '',
      elementType: '',
      elements: [table]
    }
  ]
}]

// 所有元素的展平列表
export const ConfigElements = TabsData.reduce((pre: ELementProps[], cur) => {
  let temp: ELementProps[] = [];
  const children = cur?.children;
  for (let i = 0; i < children?.length; i++) {
    const elements = children[i]?.elements;
    temp = temp.concat(elements);
  }
  return pre.concat(temp)
}, []);

// 所有元素列表转成的map结构
export const ConfigElementsMap: ElementsType = getArrMap(ConfigElements, 'id');

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