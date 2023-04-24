import React, { useEffect, useRef, useState } from 'react';
import BraftEditor, { BraftEditorProps, MediaType } from 'braft-editor';
import 'braft-editor/dist/index.css';
import classnames from 'classnames';
import { Input, Button, ButtonProps, Modal } from 'antd';
import './index.less';

export interface RichEditorProps extends BraftEditorProps {
  value?: string;
  onChange?: (val?: string) => void;
  serverURL?: string;
  getFileUrl?: (res: any) => string;
}

const RichEditor = React.forwardRef<any, RichEditorProps>((props, ref) => {

  const {
    serverURL,
    getFileUrl,
    onChange,
  } = props;

  const [content, setContent] = useState<string>();
  const BraftEditorRef = useRef<BraftEditor>(null);

  useEffect(() => {
    setContent(props?.value);
  }, [props.value]);

  const onChangeEditor: BraftEditorProps['onChange'] = (state) => {
    const htmlStr = state.toHTML();
    setContent(htmlStr);
    onChange && onChange(htmlStr);
  }

  const myUploadFn: MediaType['uploadFn'] = (param) => {
    const xhr = new XMLHttpRequest;
    const fd = new FormData();

    const successFn = (response: XMLHttpRequestEventTargetEventMap['load']) => {
      const res = xhr.responseText && JSON.parse(xhr.responseText);
      const fileUrl = getFileUrl ? getFileUrl(res) : res; // 上传后文件地址
      param.success({
        url: fileUrl,
        meta: {
          title: '',
          alt: '',
          id: res?.data?.id,
          loop: false, // 是否循环播放
          autoPlay: false, // 指定音视频是否自动播放
          controls: false, // 指定音视频是否显示控制栏
          poster: '' // 指定视频播放器的封面
        }
      });
    }

    const progressFn = (event: XMLHttpRequestEventTargetEventMap['progress']) => {
      param.progress(event.loaded / event.total * 100);
    }

    const errorFn = (response: XMLHttpRequestEventTargetEventMap['error']) => {
      param.error({
        msg: "unable to upload"
      });
    }

    xhr.upload.addEventListener('progress', progressFn, false);
    xhr.addEventListener('load', successFn, false);
    xhr.addEventListener('error', errorFn, false);
    xhr.addEventListener('abort', errorFn, false);

    fd.append('file', param.file);
    if (serverURL) {
      xhr.open('POST', serverURL, true);
      xhr.setRequestHeader('', '');
      xhr.send(fd);
    }
  }

  return (
    <BraftEditor
      ref={BraftEditorRef}
      className="rich-editor"
      defaultValue={BraftEditor.createEditorState(props?.value)}
      onChange={onChangeEditor}
      textAligns={['left', 'center', 'right']}
      fontSizes={[12, 14, 16, 18, 20, 24, 28, 30, 32, 36, 40, 48]}
      controls={[
        'undo', 'redo', 'separator',
        'font-size', 'line-height', 'letter-spacing', 'separator',
        'text-color', 'bold', 'italic', 'underline', 'strike-through', 'separator',
        'superscript', 'subscript', 'remove-styles', 'emoji', 'separator', 'text-indent', 'text-align', 'separator',
        'headings', 'list-ul', 'list-ol', 'blockquote', 'code', 'separator',
        'link', 'separator', 'hr', 'separator',
        'media', 'separator',
        'clear'
      ]}
      style={{ border: '1px solid #e8e8e8' }}
      contentStyle={{ height: '208px' }}
      contentClassName="editor-content"
      placeholder="请输入"
      media={{ uploadFn: myUploadFn, externals: undefined }}
    />
  );
});

export default RichEditor;

export interface RichEditorModalProps extends RichEditorProps {
  visible?: boolean;
  onClose?: () => void;
}
export const RichEditorModal = React.forwardRef<any, RichEditorModalProps>((props, ref) => {

  const {
    value,
    onChange,
    onClose,
    className,
  } = props;

  const [visible, setVisible] = useState<boolean>()
  const [content, setContent] = useState<string>();

  useEffect(() => {
    setContent(value);
  }, [value]);

  useEffect(() => {
    setVisible(props?.visible)
  }, [props?.visible]);

  const handleOk = () => {
    onChange && onChange(content)
    closeModal()
  }

  const closeModal = () => {
    setVisible(false);
    onClose && onClose();
  }

  const handleOnChange = (val?: string) => {
    setContent(val)
  }

  const cls = classnames(className, 'rich-editor-modal');

  return (
    <Modal
      className={cls}
      destroyOnClose
      title="富文本添加"
      visible={visible}
      onCancel={closeModal}
      onOk={handleOk}>
      <RichEditor
        value={value}
        onChange={handleOnChange}
      />
    </Modal>
  )
});

// 弹窗富文本通用组件
export interface RichEditorModalWrapperProps extends RichEditorModalProps {
  children?: (showModal: () => void, codeStr?: string) => void | any;
}
export const LinkageWrapper = (props: RichEditorModalWrapperProps) => {

  const {
    value,
    onChange,
    onClose,
    children
  } = props;

  const [visible, setVisible] = useState<boolean>()
  const [content, setContent] = useState<string>();

  useEffect(() => {
    setContent(value)
  }, [value])

  const showModal = () => {
    setVisible(true)
  }

  const closeModal = () => {
    setVisible(false);
    onClose && onClose();
  }

  const handleOnChange = (val?: string) => {
    setContent(val);
    onChange && onChange(val);
  }

  return (
    <>
      {
        typeof children === 'function' &&
        children(showModal, content)
      }
      <RichEditorModal
        visible={visible}
        value={value}
        onClose={closeModal}
        onChange={handleOnChange}
      />
    </>
  );
};

// 按钮弹窗富文本
export const RichEditorModalBtn = (props: RichEditorModalProps & ButtonProps) => {

  const {
    value,
    onChange,
  } = props;

  return (
    <LinkageWrapper value={value} onChange={onChange}>
      {
        (showModal: () => void, content?: string) => (
          <div>
            <Input.TextArea value={content} />
            <Button type="link" className="add-rich-editor" onClick={showModal}>自定义内容</Button>
          </div>
        )
      }
    </LinkageWrapper>
  );
};
