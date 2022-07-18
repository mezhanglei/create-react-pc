import React, { cloneElement, useCallback, useContext, useState, CSSProperties, useEffect } from 'react';
import { FormStoreContext, FormValuesContext } from './form-store-context';
import { FormOptions, FormOptionsContext } from './form-options-context';
import { getValuePropName, getValueFromEvent, getColProps, getCurrentPath } from './utils/utils';
import { FormRule, FormStore } from './form-store';
import classnames from 'classnames';
import { AopFactory } from '@/utils/function-aop';
import { deepGet, isEqual } from '@/utils/object';
import { Col, Row } from 'react-flexbox-grid';

export interface FormItemProps extends FormOptions {
  label?: string;
  name?: string;
  suffix?: React.ReactNode | any; // 右边节点
  footer?: React.ReactNode | any; // 底部节点
  valueProp?: string | ((type: any) => string);
  valueGetter?: (...args: any[]) => any;
  valueSetter?: (value: any) => any;
  rules?: FormRule[];
  path?: string;
  index?: number;
  initialValue?: any;
  className?: string;
  children?: React.ReactNode;
  style?: CSSProperties;
  errorClassName?: string;
  customInner?: any
}

const prefixCls = 'rh-form-field';
export const classes = {
  field: prefixCls,
  inner: 'field-inner',
  inline: `${prefixCls}--inline`,
  compact: `${prefixCls}--compact`,
  required: `${prefixCls}--required`,
  error: `${prefixCls}--error`,

  header: `${prefixCls}__header`,
  container: `${prefixCls}__container`,
  control: `${prefixCls}__control`,
  message: `${prefixCls}__message`,
  suffix: `${prefixCls}__suffix`,
  footer: `${prefixCls}__footer`
};

export const FormItem = React.forwardRef((props: FormItemProps, ref: any) => {
  const store = useContext<FormStore>(FormStoreContext)
  const initialValues = useContext(FormValuesContext)
  const options = useContext(FormOptionsContext)
  const finalProps = { ...options, ...props };
  const { children, ...fieldProps } = finalProps;
  const {
    label,
    name,
    valueProp = 'value',
    valueGetter = getValueFromEvent,
    valueSetter,
    suffix,
    footer,
    path,
    className,
    style,
    layout = "horizontal",
    inline,
    customInner,
    col,
    colon,
    compact,
    required,
    labelWidth,
    labelAlign,
    labelStyle,
    gutter,
    errorClassName = 'error',
    onFieldsChange,
    onValuesChange,
    initialValue,
    rules,
    ...restField
  } = fieldProps;

  const currentPath = getCurrentPath(name, path);
  const initialItemValue = initialValue ?? (currentPath && deepGet(initialValues, currentPath));
  const storeValue = currentPath && store?.getFieldValue(currentPath);
  const storeError = currentPath && store.getFieldError(currentPath);
  const [value, setValue] = useState(storeValue);
  const [error, setError] = useState(storeError);

  // 初始化获取初始props
  currentPath && store?.setFieldProps(currentPath, fieldProps);

  // 给子元素绑定的onChange
  const onChange = useCallback(
    (...args: any[]) => {
      const value = valueGetter(...args);
      if (currentPath && store) {
        // 设置值
        store.setFieldValue(currentPath, value);
        // 主动onchange事件
        onFieldsChange && onFieldsChange({ path: currentPath, name: name, value: value });
      }
    },
    [currentPath, store, valueGetter, onFieldsChange]
  );

  const aopOnchange = new AopFactory(onChange);

  // 回填storeValue
  useEffect(() => {
    if (!isEqual(storeValue, value)) {
      setValue(storeValue);
    }
  }, [storeValue])

  // 订阅更新值的函数
  useEffect(() => {
    if (!currentPath || !store) return
    // 订阅目标控件
    const uninstall = store.subscribeFormItem(currentPath, (newValue, oldValue) => {
      setValue(newValue);
      if (!isEqual(newValue, oldValue)) {
        onValuesChange && onValuesChange({ path: currentPath, name: name, value: newValue })
      }
    });
    return () => {
      uninstall();
    };
  }, [currentPath, store, onValuesChange]);

  // 订阅组件更新错误的函数
  useEffect(() => {
    if (!currentPath || !store) return
    // 订阅目标控件
    const uninstall = store.subscribeError(currentPath, () => {
      const error = store?.getFieldError(currentPath);
      setError(error);
    });
    return () => {
      uninstall();
    };
  }, [currentPath, store]);

  // 表单域初始化值
  useEffect(() => {
    if (!currentPath || !store) return;
    // 回填store.initialValues和回填store.values
    if (initialItemValue !== undefined) {
      store.setInitialValues(currentPath, initialItemValue);
    }
    return () => {
      // 清除该表单域的props(在设置值的前面)
      currentPath && store?.setFieldProps(currentPath, undefined);
      // 清除初始值
      currentPath && store.setInitialValues(currentPath, undefined);
    }
  }, [currentPath]);

  const childValue = (value: any) => {
    if(typeof valueSetter === 'function') {
      return valueSetter(value);
    } else {
      return value;
    }
  }

  // 最底层才会绑定value和onChange
  const bindChild = (child: any) => {
    if (currentPath && child) {
      const valuePropName = getValuePropName(valueProp, child && child.type);
      const childProps = child?.props;
      const { onChange, className } = childProps || {};
      // 对onChange方法进行aop包装，在后面添加子元素自身的onChange事件
      const aopAfterFn = aopOnchange.addAfter(onChange);
      const valueResult = childValue(value);
      const newChildProps = { className: classnames(className, error && errorClassName), [valuePropName]: valueResult, onChange: aopAfterFn }
      return cloneElement(child, newChildProps)
    } else {
      return child;
    }
  };

  // 是否为表单控件
  const isFormField = (child: any) => {
    const displayName = child?.type?.displayName;
    const formFields = ['Form.Item', 'Form.List'];
    return formFields?.includes(displayName)
  };

  // 渲染子元素
  const getChildren = (children: any) => {
    return React.Children.map(children, (child: any) => {
      if (isFormField(child)) {
        return cloneElement(child, {
          path: currentPath
        });
      } else {
        return bindNestedChildren(child);
      }
    });
  };

  // 递归遍历子元素
  const bindNestedChildren = (child: any): any => {
    const childs = child?.props?.children;
    const dataType = child?.props?.['data-type']; // 标记的需要穿透的外层容器
    const dataName = child?.props?.['data-name']; // 标记的符合value/onChange props的控件
    const childType = child?.type;
    if (childs !== undefined && (dataType === 'fragment' || typeof childType === 'string') && !dataName) {
      return cloneElement(child, {
        children: getChildren(childs)
      });
    } else {
      return bindChild(child);
    }
  };

  const childs = getChildren(children);

  const cls = classnames(
    classes.field,
    compact ? classes.compact : '',
    required ? classes.required : '',
    error ? classes.error : '',
    inline ? classes.inline : '',
    className ? className : ''
  );

  const innerCls = classnames(classes.inner, `${classes.inner}--${layout}`);

  const headerStyle = {
    marginRight: gutter,
    width: labelWidth,
    textAlign: labelAlign,
    ...labelStyle
  };

  const colProps = getColProps({ inline: inline, col });

  const InnerContent = (
    <>
      {label !== undefined && (
        <div className={classes.header} style={headerStyle}>
          {colon ? <>{label}:</> : label}
        </div>
      )}
      <div className={classes.container}>
        <Row className={classes.control}>
          {childs}
          {footer !== undefined && <div className={classes.footer}>{footer}</div>}
        </Row>
        {suffix !== undefined && <div className={classes.suffix}>{suffix}</div>}
        <div className={classes.message}>{error}</div>
      </div>
    </>
  )
  const Inner = customInner || 'div';
  const innerProps = { name, path: path, field: fieldProps };
  return (
    <Col ref={ref} className={cls} style={style} {...colProps} {...restField}>
      <Inner className={innerCls} {...(customInner ? innerProps : {})}>
        {InnerContent}
      </Inner>
    </Col>
  );
});

FormItem.displayName = 'Form.Item';
