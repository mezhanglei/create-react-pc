import React, { CSSProperties, LegacyRef, useEffect, useRef, useState } from "react";
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript';
import { IUnControlledCodeMirror, UnControlled as CodeMirror } from 'react-codemirror2';
import { evalString, uneval } from "@/utils/string";
import classNames from 'classnames';
import './editor.less';
import { Button, Input, Modal } from "antd";
import { TextAreaProps } from "antd/lib/input";
import { TextAreaRef } from "antd/lib/input/TextArea";

const prefixCls = 'options-codemirror';
const classes = {
  editor: `${prefixCls}-editor`,
  disabled: `${prefixCls}-disabled`,
  modal: `${prefixCls}-modal`,
}
export interface EditorCodeMirrorProps extends IUnControlledCodeMirror {
  value?: any;
  onChange?: (val: any) => void;
  disabled?: boolean; // 是否禁止输入
  style?: CSSProperties;
}
// 代码编辑器(不可以编辑函数)
export const EditorCodeMirror = React.forwardRef((props: EditorCodeMirrorProps, ref: LegacyRef<CodeMirror>) => {

  const {
    value,
    onChange,
    options,
    disabled,
    className,
    ...rest
  } = props;

  // 接收外界的值
  const toStr = (val: any) => {
    return typeof val === 'string' ? val : uneval(val)
  }

  const onBlur: IUnControlledCodeMirror['onBlur'] = (editor) => {
    const codeStr = editor.getValue();
    const code = evalString(codeStr);
    onChange && onChange(code);
  }

  return (
    <CodeMirror
      ref={ref}
      className={classNames(classes.editor, className, disabled ? classes.disabled : '')}
      value={toStr(value)}
      options={{
        lineNumbers: true,
        mode: 'javascript',
        gutters: ['CodeMirror-lint-markers'],
        lint: true,
        line: true,
        tabSize: 2,
        lineWrapping: true,
        readOnly: disabled,
        ...options
      }}
      onBlur={onBlur}
      {...rest}
    />
  );
});

// 函数代码编辑器(可以编辑函数)
export interface EditorFnProps extends TextAreaProps {
  value?: any;
  onChange?: (val: any) => void;
  disabled?: boolean; // 是否禁止输入
  style?: CSSProperties;
}
export const EditorFnTextArea = React.forwardRef((props: EditorFnProps, ref: LegacyRef<TextAreaRef>) => {

  const {
    value,
    onChange,
    disabled,
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
      value={toStr(value)}
      onBlur={onBlur}
      {...rest}
    />
  );
});

// 代码编辑器弹窗
export const EditorCodeMirrorModal = (
  props: EditorCodeMirrorProps & {
    onClose?: () => void;
  }) => {

  const {
    value,
    onChange,
    onClose,
    options,
    disabled,
  } = props;

  const [visible, setVisible] = useState<boolean>()
  const [codeStr, setCodeStr] = useState<string>('');
  const codemirrorRef = useRef<any>();

  // 转化为字符串
  const toStr = (val: any) => {
    return typeof val === 'string' ? val : uneval(val)
  }

  useEffect(() => {
    const code = toStr(value)
    setCodeStr(code ?? '')
  }, [value])

  const showModal = () => {
    setVisible(true)
  }

  const handleOk = () => {
    const codemirror = codemirrorRef.current;
    const editor = codemirror?.editor;
    if (editor) {
      const codeStr = editor.getValue();
      const code = evalString(codeStr);
      onChange && onChange(code);
      setCodeStr(codeStr);
    }
    closeModal()
  }

  const closeModal = () => {
    setVisible(false);
    onClose && onClose();
  }

  return (
    <>
      <div>
        <span>{codeStr}</span>
        <Button type="link" disabled={disabled} onClick={showModal}>编辑数据</Button>
      </div>
      <Modal
        destroyOnClose
        title="编辑数据"
        visible={visible}
        onCancel={closeModal}
        onOk={handleOk}>
        <EditorCodeMirror
          ref={codemirrorRef}
          value={value}
          options={options}
          disabled={disabled}
        />
      </Modal>
    </>
  );
};
