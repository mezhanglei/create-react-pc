import { evalString, uneval } from '@/utils/string';
import { Input, InputProps, InputRef } from 'antd';
import React, { CSSProperties, Ref } from 'react';

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

  // 接收外界的值
  const toStr = (val: any) => {
    return typeof val === 'string' ? val : uneval(val)
  }

  const onBlur: InputProps['onChange'] = (e) => {
    const codeStr = e?.target?.value;
    const code = evalString(codeStr);
    onChange && onChange(code);
  }

  return (
    <Input
      ref={ref}
      value={toStr(value)}
      onBlur={onBlur}
      {...rest}
    />
  );
});

export default CodeInput;
