import * as React from 'react';
import Dialog from 'rc-dialog';
import classNames from 'classnames';
import Button, { ButtonProps, BUTTON_TYPE } from '@/components/button/index';
import { canUseDom } from '@/utils/dom';

let mousePosition: { x: number; y: number } | null;
export const destroyFns: any[] = [];

const getClickPosition = (e: MouseEvent) => {
    mousePosition = {
        x: e.pageX,
        y: e.pageY,
    };
    // 100ms 内发生过点击事件，则从点击位置动画展示
    // 否则直接 zoom 展示
    // 这样可以兼容非点击方式展开
    setTimeout(() => {
        mousePosition = null;
    }, 100);
};

// 监听点击事件
if (canUseDom()) {
    document.documentElement.addEventListener('click', getClickPosition, true);
}

export type OKTYPE_BUTTON_TYPE = BUTTON_TYPE & 'danger';

export interface ModalProps {
    /** 对话框是否可见 */
    visible?: boolean;
    /** 确定按钮 loading */
    confirmLoading?: boolean;
    /** 标题 */
    title?: React.ReactNode | string;
    /** 是否显示右上角的关闭按钮 */
    closable?: boolean;
    /** 点击确定回调 */
    onOk?: (e: React.MouseEvent<HTMLElement>) => void;
    /** 点击模态框右上角叉、取消按钮、Props.maskClosable 值为 true 时的遮罩层或键盘按下 Esc 时的回调 */
    onCancel?: (e: React.MouseEvent<HTMLElement>) => void;
    afterClose?: () => void;
    /** 垂直居中 */
    centered?: boolean;
    /** 宽度 */
    width?: string | number;
    /** 底部内容 */
    footer?: React.ReactNode;
    /** 确认按钮文字 */
    okText?: React.ReactNode;
    /** 确认按钮类型 */
    okType?: OKTYPE_BUTTON_TYPE;
    /** 取消按钮文字 */
    cancelText?: React.ReactNode;
    /** 点击蒙层是否允许关闭 */
    maskClosable?: boolean;
    /** 强制渲染 Modal */
    forceRender?: boolean;
    okButtonProps?: ButtonProps;
    cancelButtonProps?: ButtonProps;
    destroyOnClose?: boolean;
    style?: React.CSSProperties;
    wrapClassName?: string;
    maskTransitionName?: string;
    transitionName?: string;
    className?: string;
    getContainer?: string | HTMLElement | getContainerFunc | false;
    zIndex?: number;
    bodyStyle?: React.CSSProperties;
    maskStyle?: React.CSSProperties;
    mask?: boolean;
    keyboard?: boolean;
    wrapProps?: any;
    prefixCls?: string;
    closeIcon?: React.ReactNode;
    modalRender?: (node: React.ReactNode) => React.ReactNode;
    focusTriggerAfterClose?: boolean;
}

type getContainerFunc = () => HTMLElement;

export interface ModalFuncProps {
    prefixCls?: string;
    className?: string;
    visible?: boolean;
    title?: React.ReactNode;
    closable?: boolean;
    content?: React.ReactNode;
    // TODO: find out exact types
    onOk?: (...args: any[]) => any;
    onCancel?: (...args: any[]) => any;
    afterClose?: () => void;
    okButtonProps?: ButtonProps;
    cancelButtonProps?: ButtonProps;
    centered?: boolean;
    width?: string | number;
    okText?: React.ReactNode;
    okType?: OKTYPE_BUTTON_TYPE;
    cancelText?: React.ReactNode;
    icon?: React.ReactNode;
    mask?: boolean;
    maskClosable?: boolean;
    zIndex?: number;
    style?: React.CSSProperties;
    maskStyle?: React.CSSProperties;
    type?: 'info' | 'success' | 'error' | 'warn' | 'warning' | 'confirm';
    keyboard?: boolean;
    getContainer?: string | HTMLElement | getContainerFunc | false;
    autoFocusButton?: null | 'ok' | 'cancel';
    transitionName?: string;
    maskTransitionName?: string;
    bodyStyle?: React.CSSProperties;
    closeIcon?: React.ReactNode;
    modalRender?: (node: React.ReactNode) => React.ReactNode;
    focusTriggerAfterClose?: boolean;
}

export interface ModalLocale {
    okText: string;
    cancelText: string;
    justOkText: string;
}

export function convertLegacyProps(type?: BUTTON_TYPE & 'danger'): ButtonProps {
    if (type === 'danger') {
        return { danger: true };
    }
    return { type };
}

export const getTransitionName = (rootPrefixCls: string, motion: string, transitionName?: string) => {
    if (transitionName !== undefined) {
      return transitionName;
    }
    return `${rootPrefixCls}-${motion}`;
  };

const Modal: React.FC<ModalProps> = props => {

    const handleCancel = (e: React.MouseEvent<HTMLButtonElement>) => {
        const { onCancel } = props;
        onCancel?.(e);
    };

    const handleOk = (e: React.MouseEvent<HTMLButtonElement>) => {
        const { onOk } = props;
        onOk?.(e);
    };

    const renderFooter = (locale: ModalLocale) => {
        const { okText, okType, cancelText, confirmLoading } = props;
        return (
            <>
                <Button onClick={handleCancel} {...props.cancelButtonProps}>
                    {cancelText || locale.cancelText}
                </Button>
                <Button
                    {...convertLegacyProps(okType)}
                    loading={confirmLoading}
                    onClick={handleOk}
                    {...props.okButtonProps}
                >
                    {okText || locale.okText}
                </Button>
            </>
        );
    };

    const {
        prefixCls = 'ant-modal',
        footer,
        visible,
        wrapClassName,
        centered,
        getContainer,
        closeIcon,
        focusTriggerAfterClose = true,
        ...restProps
    } = props;

    const rootPrefixCls = 'ant';

    const closeIconToRender = (
        <span className={`${prefixCls}-close-x`}>
            {closeIcon}
        </span>
    );

    const wrapClassNameExtended = classNames(wrapClassName, {
        [`${prefixCls}-centered`]: !!centered
    });

    return (
        <Dialog
            {...restProps}
            getContainer={
                getContainer === undefined ? document.body : getContainer
            }
            prefixCls={prefixCls}
            wrapClassName={wrapClassNameExtended}
            footer={footer === undefined ? renderFooter : footer}
            visible={visible}
            mousePosition={mousePosition}
            onClose={handleCancel}
            closeIcon={closeIconToRender}
            focusTriggerAfterClose={focusTriggerAfterClose}
            transitionName={getTransitionName(rootPrefixCls, 'zoom', props.transitionName)}
            maskTransitionName={getTransitionName(rootPrefixCls, 'fade', props.maskTransitionName)}
        />
    );
};

Modal.defaultProps = {
    width: 520,
    confirmLoading: false,
    visible: false,
    okType: 'primary' as OKTYPE_BUTTON_TYPE,
};

export default Modal;
