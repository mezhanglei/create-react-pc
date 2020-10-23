import * as React from 'react';
import { useRef } from 'react';
import classNames from 'classnames';
import CSSMotion from 'rc-motion';
import { getPositionInPage } from '@/utils/dom';
import "./Content.less";

const sentinelStyle = { width: 0, height: 0, overflow: 'hidden', outline: 'none' };

const Content = React.forwardRef((props, ref) => {
    const {
        closable,
        prefixCls = "ant-modal",
        width,
        height,
        footer,
        title,
        closeIcon,
        style,
        className,
        visible,
        bodyStyle,
        bodyProps,
        children,
        destroyOnClose,
        modalRender,
        motionName,
        ariaId,
        onClose,
        onVisibleChanged,
        onClick,
        mousePosition,
    } = props;

    const sentinelStartRef = useRef();
    const sentinelEndRef = useRef();
    const dialogRef = useRef();

    // ============================== Ref ===============================
    React.useImperativeHandle(ref, () => ({
        focus: () => {
            sentinelStartRef.current?.focus();
        },
        getDOM: () => dialogRef.current,
        changeActive: (next) => {
            const { activeElement } = document;
            if (next && activeElement === sentinelEndRef.current) {
                sentinelStartRef.current.focus();
            } else if (!next && activeElement === sentinelStartRef.current) {
                sentinelEndRef.current.focus();
            }
        },
    }));

    // ============================= Style ==============================
    const [transformOrigin, setTransformOrigin] = React.useState();
    const contentStyle = {};
    if (width !== undefined) {
        contentStyle.width = width;
    }
    if (height !== undefined) {
        contentStyle.height = height;
    }
    if (transformOrigin) {
        contentStyle.transformOrigin = transformOrigin;
    }

    function onPrepare() {
        const pagePosition = getPositionInPage(dialogRef.current);

        setTransformOrigin(
            mousePosition
                ? `${mousePosition.x - pagePosition.x}px ${mousePosition.y - pagePosition.y}px`
                : '',
        );
    }

    // ============================= Render =============================
    let footerNode;
    if (footer) {
        footerNode = <div className={`${prefixCls}-footer`}>{footer}</div>;
    }

    let headerNode;
    if (title) {
        headerNode = (
            <div className={`${prefixCls}-header`}>
                <div className={`${prefixCls}-title`} id={ariaId}>
                    {title}
                </div>
            </div>
        );
    }

    let closer;
    if (closable) {
        closer = (
            <button type="button" onClick={onClose} aria-label="Close" className={`${prefixCls}-close`}>
                {closeIcon || <span className={`${prefixCls}-close-x`} />}
            </button>
        );
    }

    const content = (
        <div className={`${prefixCls}-content`}>
            {closer}
            {headerNode}
            <div className={`${prefixCls}-body`} style={bodyStyle} {...bodyProps}>
                {children}
            </div>
            {footerNode}
        </div>
    );

    return (
        <CSSMotion
            visible={visible}
            onVisibleChanged={onVisibleChanged} // 当visible改变时都会触发
            onAppearPrepare={onPrepare} // 
            onEnterPrepare={onPrepare}
            motionName={motionName}
            removeOnLeave={destroyOnClose} // true隐藏时销毁弹窗内容
            forceRender={!destroyOnClose} // true隐藏时使用display:none缓存内容
            ref={dialogRef}
        >
            {({ className: motionClassName, style: motionStyle }, motionRef) => (
                <div
                    key="dialog-element"
                    role="document"
                    ref={motionRef}
                    style={{ ...motionStyle, ...style, ...contentStyle }}
                    className={classNames(prefixCls, className, motionClassName)}
                    onClick={onClick}
                >
                    <div tabIndex={0} ref={sentinelStartRef} style={sentinelStyle} aria-hidden="true" />
                    {modalRender ? modalRender(content) : content}
                    <div tabIndex={0} ref={sentinelEndRef} style={sentinelStyle} aria-hidden="true" />
                </div>
            )}
        </CSSMotion>
    );
});

Content.displayName = 'Content';

export default Content;
