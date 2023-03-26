import React from 'react';
import 'react-responsive-modal/styles.css';
import { Modal, ModalProps } from 'react-responsive-modal';

export interface BaseModalProps extends ModalProps {

}
const BaseModal = React.forwardRef<HTMLDivElement, BaseModalProps>((props, ref) => {

  const {
    children,
    center = true,
    ...rest
  } = props;

  return (
    <Modal ref={ref} center={center} {...rest}>
      {children}
    </Modal>
  );
});

export default BaseModal;
