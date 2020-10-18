import * as React from 'react';
import * as ReactDOM from 'react-dom';
import classNames from 'classnames';
import Modal, { destroyFns } from './Modal';
import ActionButton from './actionButton';
import "./confirmModal.less";

// 确认框封装
const ConfirmModal = (props) => {
    let {
        width = 416, // 弹窗宽度
        type, // info,success,error,warning,confirm
        prefixCls = "ant-modal",
        close, // 关闭弹窗的方法，用于在弹窗组件外部触发关闭
        onCancel, // 取消按钮的回调
        onOk, // 确认按钮的回调
        zIndex, // 弹窗层级
        afterClose, // 弹窗关闭动画结束之后执行的回调
        visible, // 设置是否可见
        keyboard, // 是否支持键盘 esc 关闭
        centered, // 是否处于屏幕中心位置
        getContainer, // false表示挂载当前组件根节点，默认为document.body
        maskStyle, // 遮罩样式
        mask = true, // 是否展示遮罩层 false时不展示
        maskClosable = false, // 是否点击遮罩层关闭  默认true,关闭
        okButtonProps, // ok按钮的props
        cancelButtonProps, // cancel按钮的props
        icon, // 提示标题的icon
        okButton, //  为false时确认按钮表示隐藏
        cancelButton, // 为false时取消按钮表示隐藏
        autoFocus = "cancel", // 焦点
        transitionName = "zoom", // 弹窗切换动画
        maskTransitionName = "fade", // mask遮罩切换动画
        className,
        style
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

    const CancelButton = cancelButton && (
        <ActionButton
            actionFn={onCancel}
            closeModal={close} // 当不传actionFn则默认关闭弹窗
            autoFocus={autoFocus === 'cancel'}
            buttonProps={cancelButtonProps}
        >
            {cancelButtonProps.text}
        </ActionButton>
    );
    const OkButton = okButton && (
        <ActionButton
            actionFn={onOk}
            closeModal={close} // 当不传actionFn则默认关闭弹窗
            autoFocus={autoFocus === 'ok'}
            buttonProps={okButtonProps}
        >
            {okButtonProps.text}
        </ActionButton>
    );

    // 弹窗内容前缀
    const wrapPrefixCls = `${prefixCls}-confirm`;
    // 弹窗内容
    const classString = classNames(
        wrapPrefixCls,
        `${wrapPrefixCls}-${type}`, // type: info,success,error,warning,confirm
        className,
    );

    // 图标
    const IconNode = icon;

    return (
        <Modal
            prefixCls={prefixCls}
            className={classString}
            wrapClassName={classNames({ [`${wrapPrefixCls}-centered`]: !!centered })}
            onCancel={() => close({ triggerCancel: true })}
            visible={visible}
            title="" // 去掉标题栏
            footer="" // 去掉footer栏
            transitionName={transitionName}
            maskTransitionName={maskTransitionName}
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
        >
            <div className={`${wrapPrefixCls}-body-wrapper`}>
                <div className={`${wrapPrefixCls}-body`}>
                    {IconNode}
                    <span className={`${wrapPrefixCls}-title`}>{props.title}</span>
                    <div className={`${wrapPrefixCls}-content`}>{props.content}</div>
                </div>
                <div className={`${wrapPrefixCls}-btns`}>
                    {CancelButton}
                    {OkButton}
                </div>
            </div>
        </Modal>
    );
};

export default function confirm(config) {
    const div = document.createElement('div');
    document.body.appendChild(div);

    let currentConfig = { ...config, close, visible: true };

    // 异步实例化
    function render(props) {
        setTimeout(() => {
            ReactDOM.render(<ConfirmModal {...props} />, div);
        });
    };

    // 关闭
    function close(...args) {
        currentConfig = {
            ...currentConfig,
            visible: false,
            afterClose: destroy.bind(this, ...args),
        };
        render(currentConfig);
    };

    // 更新
    function update(newConfig) {
        currentConfig = {
            ...currentConfig,
            ...newConfig,
        };
        render(currentConfig);
    };

    // 销毁(关闭并移出节点)
    function destroy(...args) {
        // 销毁节点并移除插入节点
        const unmountResult = ReactDOM.unmountComponentAtNode(div);
        if (unmountResult && div.parentNode) {
            div.parentNode.removeChild(div);
        }
        // 弹窗关闭时执行onCancel回调
        const triggerCancel = args.some(param => param && param.triggerCancel);
        if (config.onCancel && triggerCancel) {
            config.onCancel(...args);
        }
        // 事件池
        for (let i = 0; i < destroyFns.length; i++) {
            const fn = destroyFns[i];
            // eslint-disable-next-line no-use-before-define
            if (fn === close) {
                destroyFns.splice(i, 1);
                break;
            }
        }
    };

    render(currentConfig);
    // 注册事件池
    destroyFns.push(close);

    return {
        destroy: close,
        update,
    };
}
