import classnames from 'classnames';
import React, { useEffect, useState } from 'react';
import ModalWrapper, { ModalWrapperProps } from '@/components/global-modal/modalWrapper';
import { create } from '@/components/global-modal/createPromise';
import RenderForm from '../../form-render';
import './preview.less';
import { FormDesignData } from '../components/configs';
import PlatContainer, { PlatContainerProps } from './platContainer';
import { Radio } from 'antd';
import { PlatOptions } from '.';

export interface PreviewModalProps extends ModalWrapperProps {
  properties?: FormDesignData
}

export const PreviewModal = React.forwardRef<HTMLDivElement, PreviewModalProps>((props, ref) => {

  const {
    children,
    className,
    open,
    onClose,
    properties,
    ...rest
  } = props;

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [plat, setPlat] = useState<PlatContainerProps['plat']>('pc');

  useEffect(() => {
    setModalOpen(open);
  }, [open]);

  const closeModal = () => {
    setModalOpen(false);
    onClose && onClose();
  }

  const prefixCls = 'preview-modal';
  const cls = classnames(prefixCls, className);

  return (
    <ModalWrapper
      ref={ref}
      open={modalOpen}
      onClose={closeModal}
      classNames={{ modal: cls }}
      {...rest}>
      <div className={`${prefixCls}-title`}>预览</div>
      <Radio.Group
        className="plat-buttons"
        options={PlatOptions}
        onChange={(e) => setPlat(e?.target?.value)}
        value={plat}
        optionType="button"
        buttonStyle="solid"
      />
      <div className={`${prefixCls}-body`}>
        <PlatContainer plat={plat}>
          <RenderForm
            properties={properties}
          />
        </PlatContainer>
      </div>
    </ModalWrapper>
  );
});

// 展示弹窗
export const showPreviewModal = (props: any) => {
  const Props = {
    open: true,
    ...props,
  }
  return create(PreviewModal, { ...Props });
};