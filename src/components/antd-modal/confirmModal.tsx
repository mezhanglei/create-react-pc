import * as React from 'react';
import * as ReactDOM from 'react-dom';
import classNames from 'classnames';
import Modal, { destroyFns, getTransitionName, ModalFuncProps } from './Modal';
import ActionButton from './actionButton';
import "./confirmModal.less";

interface ConfirmDialogProps extends ModalFuncProps {
    afterClose?: () => void;
    close: (...args: any[]) => void;
    autoFocusButton?: null | 'ok' | 'cancel';
    rootPrefixCls: string;
}

const ConfirmModal = (props: ConfirmDialogProps) => {
    const {
        icon,
        onCancel,
        onOk,
        close,
        zIndex,
        afterClose,
        visible,
        keyboard,
        centered,
        getContainer,
        maskStyle,
        okText,
        okButtonProps,
        cancelText,
        cancelButtonProps,
        prefixCls = 'ant-modal',
        rootPrefixCls = 'ant',
        bodyStyle,
        closable = false,
        closeIcon,
        modalRender,
        focusTriggerAfterClose,
    } = props;

    // 支持传入{ icon: null }来隐藏`Modal.confirm`默认的Icon
    const okType = props.okType || 'primary';
    const contentPrefixCls = `${prefixCls}-confirm`;
    const width = props.width || 416;
    const style = props.style || {};
    const mask = props.mask === undefined ? true : props.mask;
    // 默认为 false，保持旧版默认行为
    const maskClosable = props.maskClosable === undefined ? false : props.maskClosable;
    const autoFocusButton = props.autoFocusButton === null ? false : props.autoFocusButton || 'ok';

    const classString = classNames(
        contentPrefixCls,
        `${contentPrefixCls}-${props.type}`,
        props.className,
    );

    const cancelButton = (
        <ActionButton
            actionFn={onCancel}
            closeModal={close}
            autoFocus={autoFocusButton === 'cancel'}
            buttonProps={cancelButtonProps}
            prefixCls={`${rootPrefixCls}-btn`}
        >
            {cancelText}
        </ActionButton>
    );

    return (
        <Modal
            prefixCls={prefixCls}
            className={classString}
            wrapClassName={classNames({ [`${contentPrefixCls}-centered`]: !!props.centered })}
            onCancel={() => close({ triggerCancel: true })}
            visible={visible}
            title=""
            footer=""
            transitionName={getTransitionName(rootPrefixCls, 'zoom', props.transitionName)}
            maskTransitionName={getTransitionName(rootPrefixCls, 'fade', props.maskTransitionName)}
            mask={mask}
            maskClosable={maskClosable}
            maskStyle={maskStyle}
            style={style}
            width={width}
            zIndex={zIndex}
            afterClose={afterClose}
            keyboard={keyboard}
            centered={centered}
            getContainer={getContainer}
            closable={closable}
            closeIcon={closeIcon}
            modalRender={modalRender}
            focusTriggerAfterClose={focusTriggerAfterClose}
        >
            <div className={`${contentPrefixCls}-body-wrapper`}>
                <div className={`${contentPrefixCls}-body`} style={bodyStyle}>
                    {icon}
                    {props.title === undefined ? null : (
                        <span className={`${contentPrefixCls}-title`}>{props.title}</span>
                    )}
                    <div className={`${contentPrefixCls}-content`}>{props.content}</div>
                </div>
                <div className={`${contentPrefixCls}-btns`}>
                    {cancelButton}
                    <ActionButton
                        type={okType}
                        actionFn={onOk}
                        closeModal={close}
                        autoFocus={autoFocusButton === 'ok'}
                        buttonProps={okButtonProps}
                        prefixCls={`${rootPrefixCls}-btn`}
                    >
                        {okText}
                    </ActionButton>
                </div>
            </div>
        </Modal>
    );
};

type ConfigUpdate = ModalFuncProps | ((prevConfig: ModalFuncProps) => ModalFuncProps);

export default function confirm(config: ModalFuncProps) {
    const div = document.createElement('div');
    document.body.appendChild(div);
    let currentConfig = { ...config, close, visible: true } as any;

    function destroy(...args: any[]) {
        const unmountResult = ReactDOM.unmountComponentAtNode(div);
        if (unmountResult && div.parentNode) {
            div.parentNode.removeChild(div);
        }
        const triggerCancel = args.some(param => param && param.triggerCancel);
        if (config.onCancel && triggerCancel) {
            config.onCancel(...args);
        }
        for (let i = 0; i < destroyFns.length; i++) {
            const fn = destroyFns[i];
            if (fn === close) {
                destroyFns.splice(i, 1);
                break;
            }
        }
    }

    function render({ okText, cancelText, prefixCls: customizePrefixCls, ...props }: any) {
        setTimeout(() => {
            ReactDOM.render(
                <ConfirmModal
                    {...props}
                    okText={okText || '取消'}
                    cancelText={cancelText || '确认'}
                />,
                div,
            );
        });
    }

    function close(...args: any[]) {
        currentConfig = {
            ...currentConfig,
            visible: false,
            afterClose: () => {
                if (typeof config.afterClose === 'function') {
                    config.afterClose();
                }
                destroy.apply(this, args);
            },
        };
        render(currentConfig);
    }

    function update(configUpdate: ConfigUpdate) {
        if (typeof configUpdate === 'function') {
            currentConfig = configUpdate(currentConfig);
        } else {
            currentConfig = {
                ...currentConfig,
                ...configUpdate,
            };
        }
        render(currentConfig);
    }

    render(currentConfig);

    destroyFns.push(close);

    return {
        destroy: close,
        update,
    };
}
