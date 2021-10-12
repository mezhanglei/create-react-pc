import * as React from 'react';
import Button, { ButtonProps } from '@/components/button/index';
import { OKTYPE_BUTTON_TYPE } from './Modal';

export interface ActionButtonProps {
    type?: OKTYPE_BUTTON_TYPE;
    actionFn?: (...args: any[]) => any | PromiseLike<any>;
    closeModal: Function;
    autoFocus?: boolean;
    prefixCls: string;
    buttonProps?: ButtonProps;
  }

const ActionButton: React.FC<ActionButtonProps> = props => {
    const ref = React.useRef();
    const [loading, setLoading] = React.useState(false);

    const {
        type,
        children,
        prefixCls,
        buttonProps, // 按钮的props
        closeModal, // 关闭弹窗的方法
        autoFocus, // 自动聚焦
        actionFn // 按钮执行的关闭或打开方法
    } = props;

    React.useEffect(() => {
        let timeoutId;
        if (autoFocus) {
            const $this = ref.current;
            timeoutId = setTimeout(() => $this.focus());
        }
        return () => {
            timeoutId && clearTimeout(timeoutId);
        };
    }, []);

    // 处理promise
    const handlePromise = (returnPromise) => {
        if (!returnPromise || !returnPromise.then) {
            return;
        }
        setLoading(true);
        returnPromise.then(
            // successCallback
            (...args) => {
                closeModal(...args);
            },
            // failureCallback
            (e) => {
                // eslint-disable-next-line no-console
                console.error(e);
                setLoading(false);
            },
        );
    };

    const onClick = () => {
        // 如果没有传递方法，默认执行关闭弹窗的方法
        if (!actionFn) {
            closeModal();
            return;
        }

        let returnPromise;

        if (actionFn.length) {
            // 如果有参数则，参数为close关闭弹窗的方法
            returnPromise = actionFn(closeModal);
        } else {
            returnPromise = actionFn();
            if (!returnPromise) {
                closeModal();
                return;
            }
        }
        // 处理返回的promise，成功则关闭弹窗
        handlePromise(returnPromise);
    };

    return (
        <Button
            type={type}
            onClick={onClick}
            loading={loading}
            prefixCls={prefixCls}
            {...buttonProps}
            ref={ref}
        >
            {children}
        </Button>
    );
};

export default ActionButton;
