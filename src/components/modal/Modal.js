import * as React from 'react';
import Dialog from './dialog/index';
// import Dialog from 'rc-dialog';
import classNames from 'classnames';
import Button from '@/components/button/index';

let mousePosition;
export const destroyFns = [];

// 100ms 内发生过点击事件，则从点击位置动画展示
// 否则直接 zoom 展示
// 这样可以兼容非点击方式展开
const getClickPosition = (e) => {
    mousePosition = {
        x: e.pageX,
        y: e.pageY,
    };
    setTimeout(() => {
        mousePosition = null;
    }, 100);
};

// 只有点击事件支持从鼠标位置动画展开
if (typeof window !== 'undefined' && window.document && window.document.documentElement) {
    document.documentElement.addEventListener('click', getClickPosition);
}

// 标准弹窗封装
const Modal = props => {

    let {
        width = 520,
        prefixCls = "ant-modal",
        onCancel,
        onOk,
        autoFocus = "cancel",
        cancelButtonProps,
        okButtonProps,
        confirmLoading,
        footer,
        visible,
        centered,
        getContainer,
        closeIcon,
        maskTransitionName = 'fade',
        transitionName = 'zoom',
        wrapClassName,
        ...rest
    } = props;

    okButtonProps = {
        type: 'primary',
        text: 'ok',
        ...okButtonProps
    };

    cancelButtonProps = {
        type: 'default',
        text: 'cancel',
        ...cancelButtonProps
    };

    const closeIconToRender = (
        closeIcon &&
        <span className={`${prefixCls}-close-x`}>
            {closeIcon}
        </span>
    );

    const handleCancel = (e) => {
        if (onCancel) {
            onCancel(e);
        }
    };

    const handleOk = (e) => {
        if (onOk) {
            onOk(e);
        }
    };

    const renderFooter = () => {
        return (
            <>
                <Button
                    onClick={handleCancel}
                    {...cancelButtonProps}
                >
                    {cancelButtonProps.text}
                </Button>
                <Button
                    loading={confirmLoading}
                    onClick={handleOk}
                    {...okButtonProps}
                >
                    {okButtonProps.text}
                </Button>
            </>
        );
    };

    return (
        <Dialog
            {...rest}
            getContainer={getContainer === undefined ? document.body : getContainer}
            prefixCls={prefixCls}
            wrapClassName={classNames(wrapClassName, { [`${prefixCls}-centered`]: !!centered })}
            footer={footer === undefined ? renderFooter() : footer}
            visible={visible}
            mousePosition={mousePosition}
            onClose={handleCancel}
            transitionName={transitionName}
            width={width}
            maskTransitionName={maskTransitionName}
            closeIcon={closeIconToRender}
        />
    );
};

export default Modal;
