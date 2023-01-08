import { evalString, uneval } from '@/utils/string';
import { Input } from 'antd';
import { TextAreaProps } from 'antd/lib/input';
import { TextAreaRef } from 'antd/lib/input/TextArea';
import React, { CSSProperties, Ref, useEffect, useState } from 'react';

// 函数代码编辑器
export interface CodeTextAreaProps extends TextAreaProps {
  value?: any;
  onChange?: (val: any) => void;
  style?: CSSProperties;
}
const CodeTextArea = React.forwardRef((props: CodeTextAreaProps, ref: Ref<TextAreaRef>) => {

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

  const onBlur: TextAreaProps['onBlur'] = (e) => {
    const codeStr = e?.target?.value;
    const code = evalString(codeStr);
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
