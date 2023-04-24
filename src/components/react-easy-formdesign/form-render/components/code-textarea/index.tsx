import { handleEvalString, handleStringify } from '@/components/react-easy-formdesign/utils/utils';
import { Input } from 'antd';
import { TextAreaProps } from 'antd/lib/input';
import { TextAreaRef } from 'antd/lib/input/TextArea';
import React, { CSSProperties, useEffect, useState } from 'react';

// 函数代码编辑器
export interface CodeTextAreaProps extends TextAreaProps {
  value?: any;
  onChange?: (val: any) => void;
  style?: CSSProperties;
}
const CodeTextArea = React.forwardRef<TextAreaRef, CodeTextAreaProps>((props, ref) => {

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

  const onBlur: TextAreaProps['onBlur'] = (e) => {
    const codeStr = e?.target?.value;
    const code = handleEvalString(codeStr);
    onChange && onChange(code);
  }

  const handleChange: TextAreaProps['onChange'] = (e) => {
    const codeStr = e?.target?.value;
    setCurValue(codeStr)
  }

  return (
    <Input.TextArea
      ref={ref}
      value={curValue}
      onBlur={onBlur}
      onChange={handleChange}
      {...rest}
    />
  );
});

export default CodeTextArea;
