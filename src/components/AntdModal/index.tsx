import { Modal, ModalProps } from 'antd';
import React, { ReactNode } from 'react';
import { useState } from 'react';
import './style.less';

export interface CustomModalProps extends ModalProps {
  displayElement?: ((showModal: () => any) => ReactNode) | ReactNode;
  onOk?: (closeModal: any) => void | Promise<void>;
  onCancel?: (closeModal: any) => void | Promise<void>;
}

// 简化使用弹窗组件
const CustomModal = (props: CustomModalProps) => {

  const {
    onCancel,
    onOk,
    displayElement,
    children,
    ...rest
  } = props;

  const [visible, setVisible] = useState<boolean>();

  const showModal = () => {
    setVisible(true);
  };

  const closeModal = () => {
    setVisible(false);
  };

  const handleCancel = async (e: any) => {
    if (typeof onCancel == 'function') {
      onCancel(closeModal);
    } else {
      closeModal();
    }
  };

  const handleOk = async (e: any) => {
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
          React.cloneElement(displayElement, { onClick: showModal } as any)
          :
          typeof displayElement === 'function' ?
            displayElement(showModal) : null
      }
      <Modal
        destroyOnClose
        centered //默认居中展示
        visible={visible}
        onCancel={handleCancel}
        onOk={handleOk}
        maskClosable={false} //默认点击蒙层不关闭弹窗
        {...rest}
      >
        {children}
      </Modal >
    </>
  );
};

export default CustomModal;
