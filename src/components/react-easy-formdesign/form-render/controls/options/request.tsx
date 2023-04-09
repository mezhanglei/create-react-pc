import classNames from "classnames";
import React, { CSSProperties, useState } from "react";
import { useFormDesign } from "../../../utils/hooks";
import { getDesignerItem, updateDesignerItem } from "../../../utils/utils";
import CodeTextArea from "../code-textarea";
import { EditorCodeMirrorModal } from "./editor";
import RenderForm, { RenderFormProps, useFormStore } from '../../../form-render';

export interface RequestSourceConfig {
  url?: string; // 请求的路径
  method?: string; // 请求方式
  requestType?: string; // 提交方式
  params?: any; // 参数
  headers?: any; // headers携带的信息
  returnFn?: string; // 解析函数字符串
}

export interface RequestResponseConfig extends Omit<RequestSourceConfig, 'returnFn'> {
  returnFn?: (val: any) => any; // 解析函数
}

export interface RequestSourceProps {
  value?: RequestSourceConfig;
  onChange?: (val?: RequestResponseConfig) => void;
  className?: string;
  style?: CSSProperties;
}

// 是否为请求配置
export const isRequestConfig = (data: any) => {
  if (typeof data === 'object') {
    if (data?.url) {
      return true;
    }
  }
}

const prefixCls = 'request-source';
const classes = {
  cls: prefixCls
}
const methodOptions = [
  { value: 'get', label: 'GET' },
  { value: 'post', label: 'POST' }
];
const requestTypeOptions = [
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

  const { selectedPath, designer } = useFormDesign();
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
    requestType: {
      label: '提交方式',
      layout: 'horizontal',
      labelWidth: 80,
      hidden: "{{formvalues && formvalues.method === 'post'}}",
      type: 'Select',
      props: {
        style: { width: '100%' },
        options: requestTypeOptions
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
    updateDesignerItem(designer, selectedPath, { attributeName: 'props.requestConfig', attributeData: newConfig })
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
