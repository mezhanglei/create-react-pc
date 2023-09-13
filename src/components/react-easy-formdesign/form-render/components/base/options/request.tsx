import classNames from "classnames";
import React, { CSSProperties, useState } from "react";
import CodeTextArea from "../CodeTextarea";
import { EditorCodeMirrorModal } from "./editor";
import RenderForm, { RenderFormProps, useFormStore } from "../../..";
import { getDesignerItem, setDesignerItem } from '../../../utils/utils';
import { useFormDesign } from '../../../utils/hooks';

export interface RequestResponseConfig {
  url?: string; // 请求的路径
  method?: string; // 请求方式
  paramsType?: string; // 参数类型
  params?: any; // 参数
  headers?: any; // headers携带的信息
  returnFn?: string | ((val: any) => any); // 解析函数字符串
}

export interface RequestSourceProps {
  value?: RequestResponseConfig;
  onChange?: (val?: RequestResponseConfig) => void;
  className?: string;
  style?: CSSProperties;
}

const prefixCls = 'request-source';
const classes = {
  cls: prefixCls
}
const methodOptions = [
  { value: 'get', label: 'GET' },
  { value: 'post', label: 'POST' }
];
const paramsTypeOptions = [
  { value: 'formData', label: 'FormData' },
  { value: 'json', label: 'JSON' }
];

const RequestSource = React.forwardRef<HTMLElement, RequestSourceProps>((props, ref) => {

  const {
    value,
    onChange,
    className,
    ...rest
  } = props;

  const { selected, designer } = useFormDesign();
  const selectedPath = selected?.path;
  const requestForm = useFormStore();
  const [properties, setProperties] = useState({
    url: {
      label: '接口',
      layout: 'horizontal',
      labelWidth: 80,
      required: true,
      type: 'Input',
      props: {
        style: { width: '100%' },
      }
    },
    method: {
      label: '请求方式',
      layout: 'horizontal',
      labelWidth: 80,
      type: 'Select',
      props: {
        style: { width: '100%' },
        options: methodOptions
      }
    },
    paramsType: {
      label: '提交方式',
      layout: 'horizontal',
      labelWidth: 80,
      hidden: "{{formvalues && formvalues.method === 'post'}}",
      type: 'Select',
      props: {
        style: { width: '100%' },
        options: paramsTypeOptions
      }
    },
    params: {
      label: '请求参数',
      layout: 'horizontal',
      labelWidth: 80,
      typeRender: <EditorCodeMirrorModal />,
    },
    headers: {
      label: 'header信息',
      layout: 'horizontal',
      labelWidth: 80,
      typeRender: <EditorCodeMirrorModal />,
    },
    returnFn: {
      label: '解析函数',
      layout: 'horizontal',
      labelWidth: 80,
      initialValue: 'function (res){\n   return res.data;\n}',
      typeRender: <CodeTextArea style={{ width: '100%' }} />,
    },
  })

  const onFieldsChange: RenderFormProps['onFieldsChange'] = ({ name, value }) => {
    if (!name) return;
    const oldProps = getDesignerItem(designer, selectedPath)?.props || {};
    const newConfig = oldProps?.requestConfig || {};
    newConfig[name] = value;
    onChange && onChange(newConfig);
    setDesignerItem(designer, newConfig, selectedPath, 'props.requestConfig')
  }

  return (
    <div className={classNames(classes.cls, className)} {...rest}>
      <RenderForm
        tagName="div"
        form={requestForm}
        properties={properties}
        onFieldsChange={onFieldsChange}
      />
    </div>
  );
});

export default RequestSource;
