import { evalString, uneval } from '@/utils/string';
import { Input, InputProps, InputRef } from 'antd';
import React, { CSSProperties, Ref, useEffect, useState } from 'react';

// 值的输入框
export interface CodeInputProps extends InputProps {
  value?: any;
  onChange?: (val: any) => void;
  style?: CSSProperties;
}
const CodeInput = React.forwardRef((props: CodeInputProps, ref: Ref<InputRef>) => {

  const {
    value,
    onChange,
    className,
    ...rest
  } = props;

  const [curValue, setCurValue] = useState<string>();

  useEffect(() => {
    setCurValue(toStr(value))
  }, [value]);

  // 接收外界的值
  const toStr = (val: any) => {
    return typeof val === 'string' ? val : uneval(val)
  }

  const onBlur: InputProps['onBlur'] = (e) => {
    const codeStr = e?.target?.value;
    // 是否为纯字符串
    const isonlyStr = codeStr?.indexOf('[') == -1 && codeStr?.indexOf('{') == -1;
    if (isonlyStr) {
      onChange && onChange(codeStr);
    } else {
      const code = evalString(codeStr);
      onChange && onChange(code);
    }
  }

  const handleChange: InputProps['onChange'] = (e) => {
    const codeStr = e?.target?.value;
    setCurValue(codeStr)
  }

  return (
    <Input
      ref={ref}
      value={curValue}
      onBlur={onBlur}
      onChange={handleChange}
      {...rest}
    />
  );
});

export default CodeInput;
