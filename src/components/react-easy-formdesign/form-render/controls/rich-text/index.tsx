import React from 'react';
// 按钮弹窗富文本
export const RichText = React.forwardRef<any, { value: string, onChange: (val?: string) => void }>((props) => {

  const {
    value,
    onChange,
    ...rest
  } = props;

  return (
    <div dangerouslySetInnerHTML={{ __html: value }} {...rest}>
    </div>
  );
});
