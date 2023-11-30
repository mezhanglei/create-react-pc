import React, { useEffect, useState } from 'react';
import classnames from 'classnames';
import { Input, Button, ButtonProps } from 'antd';
import './index.less';
import CustomModal from '@/components/AntdModal';

export interface RichEditorProps {
  value?: string;
  onChange?: (val?: string) => void;
  action?: string;
  handleResponse?: (res: any) => string;
}

const RichEditor = React.forwardRef<any, RichEditorProps>((props, ref) => {

  const {
    action,
    handleResponse,
    value,
    onChange,
  } = props;

  return <div id="editor">{value}</div>;
});

export default RichEditor;

// 按钮弹窗富文本
export const RichEditorModalBtn = (props: RichEditorProps & ButtonProps) => {

  const {
    value,
    onChange,
    className
  } = props;

  const [content, setContent] = useState<string>();

  useEffect(() => {
    setContent(value);
  }, [value]);

  const handleOk = (closeModal: () => void) => {
    closeModal();
    onChange && onChange(content);
  };

  const richOnChange = (val?: string) => {
    setContent(val);
  };

  const cls = classnames(className, 'rich-editor-modal');

  return (
    <CustomModal className={cls} title="富文本添加" onOk={handleOk} displayElement={
      (showModal) => (
        <div>
          <Input.TextArea value={value} />
          <Button type="link" className="add-rich-editor" onClick={showModal}>自定义内容</Button>
        </div>
      )
    }>
      <RichEditor
        value={value}
        onChange={richOnChange}
      />
    </CustomModal>
  );
};
