import { evalString, uneval } from '@/utils/string';
import { Input } from 'antd';
import { TextAreaProps } from 'antd/lib/input';
import { TextAreaRef } from 'antd/lib/input/TextArea';
import React, { CSSProperties, Ref } from 'react';

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

  // 接收外界的值
  const toStr = (val: any) => {
    return typeof val === 'string' ? val : uneval(val)
  }

  const onBlur: TextAreaProps['onChange'] = (e) => {
    const codeStr = e?.target?.value;
    const code = evalString(codeStr);
    onChange && onChange(code)
  }

  return (
    <Input.TextArea
      ref={ref}
      value={toStr(value)}
      onBlur={onBlur}
      {...rest}
    />
  );
});

export default CodeTextArea;
