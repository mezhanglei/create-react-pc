import React, { cloneElement, CSSProperties, useContext } from 'react'
import { FormRule } from './form-store';
import classnames from 'classnames';
import { FormOptions, FormOptionsContext, Layout } from './form-options-context';
import { FormValuesContext } from './form-store-context';
import { Col, Row } from 'react-flexbox-grid';
import { getColProps } from './utils/utils';

export interface FormListProps extends FormOptions {
  label?: string;
  suffix?: React.ReactNode;
  name?: string;
  rules?: FormRule[];
  path?: string;
  initialValue?: any[];
  className?: string;
  style?: CSSProperties;
  children?: React.ReactNode;
}

const prefixCls = 'rh-form-list';
export const classes_list = {
  list: prefixCls,
  compact: `${prefixCls}--compact`,
  required: `${prefixCls}--required`,
  error: `${prefixCls}--error`,

  header: `${prefixCls}__header`,
  container: `${prefixCls}__container`,
  control: `${prefixCls}__control`,
  message: `${prefixCls}__message`,
  footer: `${prefixCls}__footer`,
}

export const FormList = React.forwardRef((props: FormListProps, ref: any) => {
  const options = useContext(FormOptionsContext)
  const initialValues = useContext(FormValuesContext)
  const finalProps = { ...options, ...props };
  const { children, ...fieldProps } = finalProps;
  const {
    name,
    rules,
    path,
    label,
    suffix,
    className,
    style,
    layout = Layout.Horizontal,
    col,
    colon,
    compact,
    required,
    labelStyle,
    gutter,
    onFieldsChange,
    onValuesChange,
    initialValue,
    ...restField
  } = fieldProps

  const currentPath = path ? `${path}.${name}` : `${name}`;
  const initialListValue = initialValues?.[currentPath as string] ?? initialValue;

  // 是否为表单控件
  const isFormField = (child: any) => {
    const displayName = child?.type?.displayName;
    const formFields = ['FormItem', 'FormList'];
    return formFields?.includes(displayName)
  }

  // 渲染子元素
  const getChildren = (children: any) => {
    return React.Children.map(children, (child: any, index) => {
      if (isFormField(child)) {
        return renderPropsChildrenItem(child, index);
      } else {
        return bindNestedChildren(child, index);
      }
    });
  }

  // 递归遍历子元素(遇到表单域停止)
  const bindNestedChildren = (child: any, index: number): any => {
    const childs = child?.props?.children;
    if (child !== undefined && !isFormField(child)) {
      return cloneElement(child, {
        children: React.Children.map(childs, (childItem: any) => {
          if (isFormField(childItem)) {
            return renderPropsChildrenItem(childItem, index)
          } else {
            return bindNestedChildren(childItem, index)
          }
        })
      })
    } else {
      return renderPropsChildrenItem(child, index);
    }
  }

  // 渲染子元素
  const renderPropsChildrenItem = (child: any, index: number) => {
    if (isFormField(child)) {
      const childRules = (rules || [])?.concat(child?.props?.rules)?.filter((rule) => !!rule);
      const childValue = child?.props?.initialValue ?? initialListValue?.[index];
      return child && cloneElement(child, {
        path: currentPath,
        name: `[${index}]`,
        rules: childRules,
        initialValue: childValue
      });
    } else {
      return child;
    }
  }

  const childs = getChildren(children);

  const cls = classnames(
    classes_list.list,
    compact ? classes_list.compact : '',
    required ? classes_list.required : '',
    className ? className : '',
    `${classes_list.list}--${layout}`
  )

  const headerStyle = {
    marginRight: gutter,
    ...labelStyle
  }

  const colProps = getColProps({ layout: layout, col });

  return (
    <Col ref={ref} className={cls} style={style} {...colProps} {...restField}>
      {label !== undefined && (
        <div className={classes_list.header} style={headerStyle}>
          {colon ? <>{label}:</> : label}
        </div>
      )}
      <div className={classes_list.container}>
        <Row className={classes_list.control}>
          {childs}
        </Row>
      </div>
      {suffix !== undefined && <div className={classes_list.footer}>{suffix}</div>}
    </Col>
  )
});

FormList.displayName = 'FormList';
