import { Modal, ModalProps } from 'antd';
import React, { useState } from 'react';
import './style.less';

export interface CustomModalProps {
  displayElement?: ((showModal: () => void) => React.ReactElement) | React.ReactElement;
  onOk?: (closeModal: () => void) => void | Promise<void>;
  onCancel?: (closeModal: () => void) => void | Promise<void>;
  modalProps?: ModalProps;
  children?: React.ReactNode;
}

// 简化使用弹窗组件
const CustomModal = (props: CustomModalProps) => {

  const {
    onCancel,
    onOk,
    displayElement,
    modalProps,
    children,
    ...rest
  } = props;

  const [visible, setVisible] = useState<boolean>();

  const showModal = async () => {
    if (typeof displayElement !== 'function') {
      displayElement?.props?.onClick?.();
    }
    setVisible(true);
  };

  const closeModal = () => {
    setVisible(false);
  };

  const handleCancel = async () => {
    if (typeof onCancel == 'function') {
      onCancel(closeModal);
    } else {
      closeModal();
    }
  };

  const handleOk = async () => {
    if (typeof onOk == 'function') {
      onOk(closeModal);
    } else {
      closeModal();
    }
  };

  return (
    <>
      {
        React.isValidElement(displayElement) ?
          React.cloneElement(displayElement, { onClick: showModal, ...rest } as React.Attributes)
          :
          typeof displayElement === 'function' ? displayElement(showModal) : displayElement
      }
      <Modal
        destroyOnClose
        centered //默认居中展示
        visible={visible}
        onCancel={handleCancel}
        onOk={handleOk}
        maskClosable={false} //默认点击蒙层不关闭弹窗
        {...modalProps}
      >
        {children}
      </Modal>
    </>
  );
};

export default CustomModal;
