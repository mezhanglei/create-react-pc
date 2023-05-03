import classnames from 'classnames';
import React, { useEffect, useState } from 'react';
import ModalWrapper, { ModalWrapperProps } from './modalWrapper';

export interface DemoModalProps extends ModalWrapperProps {

}

// 弹窗容器
export const DemoModal = React.forwardRef<HTMLDivElement, DemoModalProps>((props, ref) => {

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

  const cls = classnames('modal-demo', className);

  return (
    <ModalWrapper
      ref={ref}
      open={modalOpen}
      onClose={closeModal}
      classNames={{ modal: cls }}
      {...rest}>
      1111111
    </ModalWrapper>
  );
});
