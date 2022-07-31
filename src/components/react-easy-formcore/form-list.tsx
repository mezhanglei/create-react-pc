import React, { cloneElement, CSSProperties, useContext } from 'react'
import classnames from 'classnames';
import { FormOptions, FormOptionsContext } from './form-options-context';
import { FormValuesContext } from './form-store-context';
import { Col } from 'react-flexbox-grid';
import { getColProps, getCurrentPath } from './utils/utils';
import { deepGet } from '@/utils/object';
import { FormRule } from './validator';
import { Control } from './control';
import { Label } from './label';

export interface FormListProps extends FormOptions {
  label?: string;
  name?: string;
  suffix?: React.ReactNode | any; // 右边节点
  footer?: React.ReactNode | any; // 底部节点
  rules?: FormRule[];
  path?: string;
  index?: number;
  initialValue?: any[];
  className?: string;
  style?: CSSProperties;
  children?: React.ReactNode;
  customInner?: any;
}

const prefixCls = 'rh-form-list';
export const classes_list = {
  list: prefixCls,
  inner: 'field-inner',
  inline: `${prefixCls}--inline`,
  compact: `${prefixCls}--compact`,
  required: `${prefixCls}--required`,
  error: `${prefixCls}--error`
};

export const FormList = React.forwardRef((props: FormListProps, ref: any) => {
  const options = useContext(FormOptionsContext);
  const initialValues = useContext(FormValuesContext);
  const finalProps = { ...options, ...props };
  const { children, ...fieldProps } = finalProps;
  const {
    name,
    rules,
    path,
    label,
    suffix,
    footer,
    className,
    style,
    layout = "horizontal",
    customInner,
    inline,
    col,
    colon,
    compact,
    required,
    labelWidth,
    labelAlign,
    labelStyle,
    gutter,
    onFieldsChange,
    onValuesChange,
    initialValue,
    ...restField
  } = fieldProps;

  const currentPath = getCurrentPath(name, path);
  const initialListValue = initialValue ?? (currentPath && deepGet(initialValues, currentPath));

  // 是否为表单控件
  const isFormField = (child: any) => {
    const displayName = child?.type?.displayName;
    const formFields = ['Form.Item', 'Form.List'];
    return formFields?.includes(displayName);
  };

  // 渲染子元素
  let index = 0;
  const getChildren = (children: any) => {
    return React.Children.map(children, (child: any) => {
      if (isFormField(child)) {
        return renderFormItem(child);
      } else {
        return bindNestedChildren(child);
      }
    });
  };

  // 递归遍历子元素(遇到表单域停止)
  const bindNestedChildren = (child: any): any => {
    const childs = child?.props?.children;
    if (child !== undefined && !isFormField(child)) {
      return cloneElement(child, {
        children: getChildren(childs)
      });
    } else if (isFormField(child)) {
      return renderFormItem(child);
    } else {
      return child;
    }
  };

  // 渲染表单域子元素
  const renderFormItem = (child: any) => {
    const currentIndex = index;
    index++;
    const childRules = (rules || [])?.concat(child?.props?.rules)?.filter((rule) => !!rule);
    const childValue = child?.props?.initialValue ?? initialListValue?.[currentIndex];
    return child && cloneElement(child, {
      path: currentPath,
      name: `[${currentIndex}]`,
      rules: childRules,
      initialValue: childValue
    });
  };

  const childs = getChildren(children);

  const cls = classnames(
    classes_list.list,
    compact ? classes_list.compact : '',
    required ? classes_list.required : '',
    inline ? classes_list.inline : '',
    className ? className : '',
  );

  const innerCls = classnames(classes_list.inner, `${classes_list.inner}--${layout}`);

  const headerStyle = {
    marginRight: gutter,
    width: labelWidth,
    textAlign: labelAlign,
    ...labelStyle
  };

  const colProps = getColProps({ inline: inline, col });

  const Inner = customInner || 'div';
  const innerProps = { name, path: path, field: fieldProps };
  return (
    <Col ref={ref} className={cls} style={style} {...colProps} {...restField}>
      <Inner className={innerCls} {...(customInner ? innerProps : {})}>
        <Label colon={colon} style={headerStyle}>
          {label}
        </Label>
        <Control compact={compact} footer={footer} suffix={suffix}>
          {childs}
        </Control>
      </Inner>
    </Col>
  );
});

FormList.displayName = 'Form.List';
