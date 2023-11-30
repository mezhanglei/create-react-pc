import React, { CSSProperties, FocusEventHandler, useEffect, useRef, useState } from "react";
import classNames from 'classnames';
import './index.less';
import { Button } from "antd";
import { js_beautify } from 'js-beautify';
import { handleEvalString, handleStringify } from "@/components/react-easy-formdesign/render/utils/utils";
import CustomModal from "@/components/AntdModal";
import { javascript } from '@codemirror/lang-javascript';
import CodeMirror, { ViewUpdate } from '@uiw/react-codemirror';
import { json } from "@codemirror/lang-json";

const prefixCls = 'custom-editor';
const classes = {
  editor: prefixCls,
  disabled: `${prefixCls}-disabled`,
  modal: `${prefixCls}-modal`,
};
export interface EditorCodeMirrorProps {
  value?: any;
  onChange?: (val: any) => void;
  disabled?: boolean; // 是否禁止输入
  className?: string;
  style?: CSSProperties;
}
// 代码编辑器(不可以编辑函数)
export const EditorCodeMirror = React.forwardRef<any, EditorCodeMirrorProps>((props, ref) => {

  const {
    value,
    onChange,
    disabled = true,
    className,
    ...rest
  } = props;

  const editorRef = useRef<ViewUpdate>(null);

  const onBlur: FocusEventHandler = () => {
    const cm = editorRef.current?.view;
    const codeStr = cm?.state.doc.toString() || '';
    const code = handleEvalString(codeStr);
    onChange && onChange(code);
  };

  const codeStr = handleStringify(value);
  const formatStr = codeStr && js_beautify(codeStr, {
    indent_size: 2
  });

  return <CodeMirror
    ref={editorRef}
    value={formatStr}
    editable={disabled ? false : true}
    className={classNames(classes.editor, className, disabled ? classes.disabled : '')}
    extensions={[javascript(), json()]}
    onBlur={onBlur}
  />;
});

// 代码编辑器弹窗
export const EditorCodeMirrorModal = (props: EditorCodeMirrorProps) => {

  const {
    value,
    onChange,
    disabled,
  } = props;

  const [codeStr, setCodeStr] = useState<string>('');
  const codemirrorRef = useRef<any>();

  useEffect(() => {
    const code = handleStringify(value);
    setCodeStr(code ?? '');
  }, [value]);

  const handleOk = (closeModal: () => void) => {
    const codemirror = codemirrorRef.current;
    const editor = codemirror?.editor;
    closeModal();
    if (editor) {
      const codeStr = editor.getValue();
      setCodeStr(codeStr);
      const code = handleEvalString(codeStr);
      onChange && onChange(code);
    }
  };

  return (
    <CustomModal title="编辑数据" onOk={handleOk} displayElement={
      (showModal) => (
        <div>
          <span>{codeStr}</span>
          <Button type="link" disabled={disabled} onClick={showModal}>编辑数据</Button>
        </div>
      )
    }>
      <EditorCodeMirror
        ref={codemirrorRef}
        value={value}
        disabled={disabled}
      />
    </CustomModal>
  );
};
