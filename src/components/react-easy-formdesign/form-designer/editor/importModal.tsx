import classnames from 'classnames';
import React, { useEffect, useState } from 'react';
import ModalWrapper, { ModalWrapperProps } from '@/components/GlobalModal/modalWrapper';
import { create } from '@/components/GlobalModal/createPromise';
import { Button, Col, Row } from 'antd';
import './importModal.less';

export interface ImportModalProps extends ModalWrapperProps {

}

export const ImportModal = React.forwardRef<HTMLDivElement, ImportModalProps>((props, ref) => {

  const {
    children,
    className,
    open,
    onClose,
    ...rest
  } = props;

  const [modalOpen, setModalOpen] = useState<boolean>(false);

  useEffect(() => {
    setModalOpen(open);
  }, [open]);

  const closeModal = () => {
    setModalOpen(false);
  }

  const prefixCls = 'import-modal';
  const cls = classnames(prefixCls, className);

  const loadJson = (item) => {

  }

  return (
    <ModalWrapper
      ref={ref}
      open={modalOpen}
      onClose={closeModal}
      classNames={{ modal: cls }}
      {...rest}>
      <div className={`${prefixCls}-title`}>导入模板</div>
      <Row className={`${prefixCls}-body`} gutter={16}>
        <Col className={`${prefixCls}-col`} span={6}>
          <div className={`${prefixCls}-col-img`}>
            <img />
          </div>
          <div className={`${prefixCls}-col-name`}>
            1111
          </div>
          <div className={`${prefixCls}-col-cover`}>
            <Button type='primary' onClick={() =>loadJson(1)}>加载模板</Button>
          </div>
        </Col>
      </Row>
    </ModalWrapper>
  );
});

// 展示弹窗
export const showImportModal = (props?: Partial<ImportModalProps>) => {
  const Props = {
    open: true,
    ...props,
  }
  return create(ImportModal, { ...Props })
};