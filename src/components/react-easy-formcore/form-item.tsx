import React, { cloneElement, isValidElement, useCallback, useContext, useState, CSSProperties, useEffect } from 'react';
import { FormStoreContext, FormValuesContext } from './form-store-context';
import { FormOptions, FormOptionsContext } from './form-options-context';
import { getValuePropName, getValueFromEvent, isListItem } from './utils/utils';
import { FormRule } from './form-store';
import classnames from 'classnames';
import { AopFactory } from '@/utils/function-aop';
import { isObjectEqual } from '@/utils/object';

export interface FormItemProps extends FormOptions {
  label?: string;
  name?: string;
  valueProp?: string | ((type: any) => string);
  valueGetter?: (...args: any[]) => any;
  suffix?: React.ReactNode;
  rules?: FormRule[];
  path?: string;
  initialValue?: any;
  className?: string;
  children?: React.ReactNode;
  style?: CSSProperties;
  errorClassName?: string;
}

const prefixCls = 'rh-form-field';
export const classes = {
  field: prefixCls,
  compact: `${prefixCls}--compact`,
  required: `${prefixCls}--required`,
  error: `${prefixCls}--error`,

  header: `${prefixCls}__header`,
  container: `${prefixCls}__container`,
  control: `${prefixCls}__control`,
  message: `${prefixCls}__message`,
  footer: `${prefixCls}__footer`,
}

export const FormItem = React.forwardRef((props: FormItemProps, ref: any) => {
  const store = useContext(FormStoreContext)
  const initialValues = useContext(FormValuesContext)
  const options = useContext(FormOptionsContext)
  const finalProps = { ...options, ...props };
  const { children, ...fieldProps } = finalProps;
  const {
    label,
    name,
    valueProp = 'value',
    valueGetter = getValueFromEvent,
    suffix,
    path,
    className,
    style,
    layout = 'horizontal',
    compact,
    required,
    labelStyle,
    gutter,
    errorClassName = 'error',
    onFieldsChange,
    onValuesChange
  } = fieldProps;

  // 拼接当前项的path
  const getCurrentPath = (name?: string, parent?: string) => {
    if (name === undefined) return name;
    if (isListItem(name)) {
      return parent ? `${parent}${name}` : name;
    } else {
      return parent ? `${parent}.${name}` : name;
    }
  }

  const currentPath = getCurrentPath(name, path);
  const initialValue = initialValues?.[currentPath as string] ?? fieldProps?.initialValue;
  const [value, setValue] = useState(currentPath && store ? store.getFieldValue(currentPath) : undefined);
  const [error, setError] = useState(currentPath && store ? store.getFieldError(currentPath) : undefined);

  // 给子元素绑定的onChange
  const onChange = useCallback(
    (...args: any[]) => {
      const value = valueGetter(...args);
      if (currentPath && store) {
        // 设置值
        store.setFieldValue(currentPath, value);
        // 主动onchange事件
        onFieldsChange && onFieldsChange({ path: currentPath, value: value });
      }
    },
    [currentPath, store, valueGetter]
  )

  const aopOnchange = new AopFactory(onChange);

  // 订阅更新值的函数
  useEffect(() => {
    if (!currentPath || !store) return
    // 订阅目标控件
    const uninstall = store.subscribeValue(currentPath, (newValue, oldValue) => {
      setValue(newValue);
      // 不监听`initialValue`赋值
      if (oldValue !== undefined && !isObjectEqual(newValue, oldValue)) {
        onValuesChange && onValuesChange({ path: currentPath, value: newValue })
      }
    })
    return () => {
      uninstall()
    }
  }, [currentPath, store]);

  // 订阅组件更新错误的函数
  useEffect(() => {
    if (!currentPath || !store) return
    // 订阅目标控件
    const uninstall = store.subscribeError(currentPath, () => {
      const error = store?.getFieldError(currentPath);
      setError(error);
    })
    return () => {
      uninstall()
    }
  }, [currentPath, store]);

  // 表单域初始化值
  useEffect(() => {
    if (!currentPath || !store) return;
    if (initialValue !== undefined) {
      // 回填store.values
      store.setFieldValue(currentPath, initialValue, true);
      // 回填store.initialValues
      store.setInitialValues(currentPath, initialValue);
    }
    store?.setFieldProps(currentPath, fieldProps);
    return () => {
      // 清除该表单域的props(在设置值的前面)
      store?.setFieldProps(currentPath, undefined);
      // 清除值
      store.setFieldValue(currentPath, undefined, true);
      // 清除初始值
      store.setInitialValues(currentPath, undefined);
    }
  }, [currentPath, store]);

  // 最底层才会绑定value和onChange
  const bindChild = (child: any) => {
    if (currentPath && isValidElement(child)) {
      const valuePropName = getValuePropName(valueProp, child && child.type);
      const childProps = child?.props as any;
      const { onChange, className } = childProps || {};
      // 对onChange方法进行aop包装，在后面添加子元素自身的onChange事件
      const aopAfterFn = aopOnchange.addAfter(onChange);
      const newChildProps = { className: classnames(className, error && errorClassName), [valuePropName]: value, onChange: aopAfterFn }
      return cloneElement(child, newChildProps)
    } else {
      return child;
    }
  }

  // 是否为表单控件
  const isFormField = (child: any) => {
    const displayName = child?.type?.displayName;
    const formFields = ['FormItem', 'FormList'];
    return formFields?.includes(displayName)
  }

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
    })
  }

  // 递归遍历子元素
  const bindNestedChildren = (child: any): any => {
    const childs = child?.props?.children;
    const dataType = child?.props?.['data-type'];
    if (childs !== undefined && dataType === 'fragment') {
      return cloneElement(child, {
        children: React.Children.map(childs, (childItem: any) => {
          if (isFormField(childItem)) {
            return cloneElement(childItem, {
              path: currentPath
            });
          } else {
            return bindNestedChildren(childItem)
          }
        })
      })
    } else {
      return bindChild(child);
    }
  }

  const childs = getChildren(children);

  const cls = classnames(
    classes.field,
    compact ? classes.compact : '',
    required ? classes.required : '',
    error ? classes.error : '',
    className ? className : '',
    `${classes.field}--${layout}`,
  )

  const headerStyle = {
    marginRight: gutter,
    ...labelStyle
  }

  return (
    <div ref={ref} className={cls} style={style}>
      {label !== undefined && (
        <div className={classes.header} style={headerStyle}>
          {label}
        </div>
      )}
      <div className={classes.container}>
        <div className={classes.control}>
          {childs}
        </div>
        <div className={classes.message}>{error}</div>
      </div>
      {suffix !== undefined && <div className={classes.footer}>{suffix}</div>}
    </div>
  )
})

FormItem.displayName = 'FormItem';
