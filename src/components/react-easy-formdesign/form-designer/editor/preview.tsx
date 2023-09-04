import classnames from 'classnames';
import React, { useEffect, useState } from 'react';
import ModalWrapper, { ModalWrapperProps } from '@/components/GlobalModal/modalWrapper';
import { create } from '@/components/GlobalModal/createPromise';
import RenderForm, { useFormStore } from '../../form-render';
import './preview.less';
import { FormDesignData } from '../../form-render/configs/components';
import PlatContainer, { PlatContainerProps, PlatOptions } from './platContainer';
import { Button, Radio } from 'antd';
import { showExportJsonModal } from './exportJson';
import { CloseOutlined } from '@ant-design/icons';

export interface PreviewModalProps extends ModalWrapperProps {
  properties?: FormDesignData;
  plat?: PlatContainerProps['plat'];
}

export const PreviewModal = React.forwardRef<HTMLDivElement, PreviewModalProps>((props, ref) => {

  const {
    children,
    className,
    open,
    onClose,
    properties,
    plat,
    ...rest
  } = props;

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [disabled, setDisabled] = useState<boolean>();
  const [platType, setPlatType] = useState<PlatContainerProps['plat']>('pc');
  const form = useFormStore();

  useEffect(() => {
    setModalOpen(open);
  }, [open]);

  useEffect(() => {
    if (plat) {
      setPlatType(plat);
    }
  }, [plat]);

  const getFormValue = async () => {
    const { error, values } = await form.validate();
    if (error) return;
    showExportJsonModal({ data: values, title: '表单数据' });
  }

  const resetForm = () => {
    form.reset();
  }

  const switchDisabled = () => {
    setDisabled(!disabled);
  }

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
      <div className={`${prefixCls}-title`}>
        预览
        <CloseOutlined onClick={closeModal} className={`${prefixCls}-close`} />
      </div>
      <Radio.Group
        className="plat-buttons"
        options={PlatOptions}
        onChange={(e) => setPlatType(e?.target?.value)}
        value={platType}
        optionType="button"
        buttonStyle="solid"
      />
      <div className={`${prefixCls}-body`}>
        <PlatContainer plat={platType}>
          <RenderForm
            options={{props:{disabled: disabled}}}
            form={form}
            properties={properties}
          />
        </PlatContainer>
      </div>
      <div className={`${prefixCls}-foot`}>
        <Button type='primary' onClick={getFormValue}>获取数据</Button>
        <Button type='default' onClick={resetForm}>重置</Button>
        <Button type='default' onClick={switchDisabled}>{disabled ? '启用' : "禁用"}编辑</Button>
        <Button type='default' onClick={closeModal}>关闭</Button>
      </div>
    </ModalWrapper>
  );
});

// 展示弹窗
export const showPreviewModal = (props: Partial<PreviewModalProps>) => {
  const Props = {
    open: true,
    ...props,
  }
  return create(PreviewModal, { ...Props });
};