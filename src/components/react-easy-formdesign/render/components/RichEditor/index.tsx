import React, { useEffect, useRef, useState } from 'react';
import classnames from 'classnames';
import { Input, Button, ButtonProps } from 'antd';
import './index.less';
import CustomModal from '@/components/AntdModal';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';


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

  const editorRef = useRef<Quill>();
  const parentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const quill = new Quill(parentRef.current, {
      theme: 'snow'
    });
    quill.on('text-change', function (delta, oldDelta, source) {
      if (source == 'user') {
        const htmlStr = quill.root.innerHTML;
        onChange && onChange(htmlStr);
      }
    });
    quill.pasteHTML(value || '');
    const index = quill.getLength();
    quill.setSelection(index, Quill.sources.USER); // 需要设置USER否则移动端光标会异常
    editorRef.current = quill;
  }, []);

  return (
    <div className='custom-editor'>
      <div ref={parentRef}></div>
    </div>
  );
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
