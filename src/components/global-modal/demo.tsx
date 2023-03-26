import classnames from 'classnames';
import React, { useEffect, useState } from 'react';
import 'react-responsive-modal/styles.css';
import BaseModal, { BaseModalProps } from './baseModal';
import "./demo.less";

export interface DemoModalProps extends BaseModalProps {
  onResolve?: (val?: any) => void;
  onReject?: (val?: any) => void;
  className?: string;
}

// 大切换弹窗
export const DemoModal = React.forwardRef<HTMLDivElement, DemoModalProps>((props, ref) => {

  const {
    children,
    className,
    onClose,
    open,
    showCloseIcon = false,
    onResolve,
    onReject,
    ...rest
  } = props;

  const [modalOpen, setModalOpen] = useState<boolean>(false);

  useEffect(() => {
    setModalOpen(open);
  }, [open]);

  const handleOk = () => {
    closeModal()
    onResolve && onResolve()
  }

  const handleCancel = () => {
    closeModal();
    onReject && onReject();
  }

  const closeModal = () => {
    setModalOpen(false);
  }

  const cls = classnames('modal-demo', className);

  return (
    <BaseModal
      ref={ref}
      open={modalOpen}
      showCloseIcon={showCloseIcon}
      onClose={closeModal}
      classNames={{ modal: cls }}
      {...rest}>
      <h2>Simple centered modal</h2>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam
        pulvinar risus non risus hendrerit venenatis. Pellentesque sit amet
        hendrerit risus, sed porttitor quam.
      </p>
    </BaseModal>
  );
});
