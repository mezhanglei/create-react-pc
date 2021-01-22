import React, { useEffect, useState, useRef, ReactNode } from "react";
import "./index.less";
import classNames from "classnames";


export interface CheckboxProps {
    prefixCls: string;
    checked?: boolean; // 选中状态
    indeterminate?: boolean; // 不完全选中状态
    disabled?: boolean; // 禁用状态
    children: ReactNode;
    className?: string;
    onChange: (checked: boolean) => void;
    ref: any;
    [propsName: string]: any;
}

// checkBox组件
const CheckBox: React.FC<CheckboxProps> = (props: CheckboxProps) => {

    const {
        prefixCls = "mine-checkbox-wrapper",
        indeterminate,
        disabled,
        children,
        className,
        onChange,
        ref,
        ...rest
    } = props;

    const checkboxRef = ref || React.createRef();
    let [checked, setChecked] = useState<boolean>(false);

    useEffect(() => {
        checkboxRef.current.disabled = props.disabled;
    }, [props.disabled]);

    useEffect(() => {
        checkedChange(props.checked);
    }, [props.checked]);

    // change
    const checkedChange = (value: boolean = false) => {
        checkboxRef.current.value = value;
        setChecked(value);
    };

    // 切换
    const toggleOption = (e: any) => {
        checkedChange(e.target.checked);
        onChange && onChange(e.target.checked);
    };

    const classString = classNames(prefixCls, className, {
        [`${prefixCls}-checked`]: !indeterminate && checked,
        [`${prefixCls}-disabled`]: disabled
    });

    const iconClass = classNames('check-icon', {
        [`check-icon-checked`]: !indeterminate && checked,
        [`check-icon-indeterminate`]: indeterminate
    });

    return (
        <label
            {...rest}
            className={classString}
        >
            <span className='check-box'>
                <input ref={checkboxRef} onChange={toggleOption} type="checkbox" />
                <span className={iconClass}></span>
            </span>
            {children !== undefined && <span>{children}</span>}
        </label>
    );
};

export default CheckBox;
