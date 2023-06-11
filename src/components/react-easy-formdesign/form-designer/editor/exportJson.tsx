import classnames from 'classnames';
import React, { useEffect, useState } from 'react';
import ModalWrapper, { ModalWrapperProps } from '@/components/global-modal/modalWrapper';
import { create } from '@/components/global-modal/createPromise';
import './exportJson.less';
import { FormDesignData } from '../components/configs';
import { EditorCodeMirror } from '../../form-render/components/options/editor';
import { Button } from 'antd';
import { copyToClipboard } from '@/utils/string';
import { saveAsFile } from '@/utils/file';
import js_beautify from 'js-beautify';

export interface ExportJsonModalProps extends ModalWrapperProps {
  properties?: FormDesignData
}

export const ExportJsonModal = React.forwardRef<HTMLDivElement, ExportJsonModalProps>((props, ref) => {

  const {
    children,
    className,
    open,
    onClose,
    properties,
    ...rest
  } = props;

  const [modalOpen, setModalOpen] = useState<boolean>(false);

  useEffect(() => {
    setModalOpen(open);
  }, [open]);

  const closeModal = () => {
    setModalOpen(false);
    onClose && onClose();
  }

  const copyJson = (e: any) => {
    copyToClipboard(JSON.stringify(properties), e);
  }

  const downloadJS = () => {
    const str = JSON.stringify(properties);
    const formatStr = str && js_beautify(str, {
      indent_size: 2
    });
    const fileId = new Date().toLocaleTimeString();
    saveAsFile(formatStr, `formData_${fileId}.json`);
  }

  const prefixCls = 'export-json-modal';
  const cls = classnames(prefixCls, className);

  return (
    <ModalWrapper
      ref={ref}
      open={modalOpen}
      onClose={closeModal}
      classNames={{ modal: cls }}
      {...rest}>
      <div className={`${prefixCls}-title`}>预览</div>
      <div className={`${prefixCls}-body`}>
        <EditorCodeMirror
          className={`${prefixCls}-content`}
          value={JSON.stringify(properties)}
          options={{ readOnly: true, }}
        />
      </div>
      <div className={`${prefixCls}-footer`}>
        <Button type='default' onClick={copyJson}>复制JSON</Button>
        <Button type='primary' onClick={downloadJS}>导出文件</Button>
        <Button type='default' onClick={closeModal}>关闭</Button>
      </div>
    </ModalWrapper>
  );
});

// 展示弹窗
export const showExportJsonModal = (props: any) => {
  const Props = {
    open: true,
    ...props,
  }
  return create(ExportJsonModal, { ...Props });
};