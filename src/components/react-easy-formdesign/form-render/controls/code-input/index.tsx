import { handleEvalString, handleStringify } from '@/components/react-easy-formdesign/utils/utils';
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
    setCurValue(handleStringify(value))
  }, [value]);

  const onBlur: InputProps['onBlur'] = (e) => {
    const codeStr = e?.target?.value;
    const code = handleEvalString(codeStr);
    onChange && onChange(code);
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
