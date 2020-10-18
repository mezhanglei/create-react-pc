import * as React from 'react';
import { useRef, useEffect } from 'react';
import classNames from 'classnames';
import KeyCode from '@/utils/keyCode';
import { isContains } from '@/utils/dom';
import Mask from './Mask';
import { getMotionName, getUUID } from '../utils/common';
import Content from './Content';

export default function Dialog(props) {
    const {
        prefixCls = 'ant-modal',
        zIndex,
        visible = false,
        keyboard = true,
        focusTriggerAfterClose = true,
        switchScrollingEffect,

        // Wrapper
        title,
        wrapStyle,
        wrapClassName,
        wrapProps,
        onClose,
        afterClose,

        // Dialog
        transitionName,
        animation,
        closable = true,

        // Mask
        mask = true,
        maskTransitionName,
        maskAnimation,
        maskClosable = false,
        maskStyle,
        maskProps,
    } = props;

    const lastOutSideActiveElementRef = useRef();
    const wrapperRef = useRef();
    const contentRef = useRef();

    const [animatedVisible, setAnimatedVisible] = React.useState(visible);

    // ========================== Init ==========================
    const ariaIdRef = useRef();
    if (!ariaIdRef.current) {
        ariaIdRef.current = `rcDialogTitle${getUUID()}`;
    }

    // ========================= Events =========================
    function onDialogVisibleChanged(newVisible) {
        if (newVisible) {
            // Try to focus
            if (!isContains(wrapperRef.current, document.activeElement)) {
                lastOutSideActiveElementRef.current = document.activeElement;
                contentRef.current?.focus();
            }
        } else {
            setAnimatedVisible(false);
            switchScrollingEffect();
            if (mask && lastOutSideActiveElementRef.current && focusTriggerAfterClose) {
                try {
                    lastOutSideActiveElementRef.current.focus({ preventScroll: true });
                } catch (e) {
                    // Do nothing
                }
                lastOutSideActiveElementRef.current = null;
            }

            afterClose?.();
        }
    }

    function onInternalClose(e) {
        onClose?.(e);
    }

    // >>> Content
    const contentClickRef = useRef(false);
    const contentTimeoutRef = useRef();

    // We need record content click incase content popup out of dialog
    const onContentClick = () => {
        clearTimeout(contentTimeoutRef.current);
        contentClickRef.current = true;

        contentTimeoutRef.current = setTimeout(() => {
            contentClickRef.current = false;
        });
    };

    // >>> Wrapper
    // Close only when element not on dialog
    let onWrapperClick = null;
    if (maskClosable) {
        onWrapperClick = (e) => {
            if (
                !contentClickRef.current &&
                !isContains(contentRef.current.getDOM(), e.target)
            ) {
                onInternalClose(e);
            }
        };
    }

    function onWrapperKeyDown(e) {
        if (keyboard && e.keyCode === KeyCode.ESC) {
            e.stopPropagation();
            onInternalClose(e);
            return;
        }

        // keep focus inside dialog
        if (visible) {
            if (e.keyCode === KeyCode.TAB) {
                contentRef.current.changeActive(!e.shiftKey);
            }
        }
    }

    // ========================= Effect =========================
    useEffect(() => {
        if (visible) {
            setAnimatedVisible(true);
            switchScrollingEffect();
        }
    }, [visible]);

    // Remove direct should also check the scroll bar update
    useEffect(
        () => () => {
            switchScrollingEffect();
            clearTimeout(contentTimeoutRef.current);
        },
        [],
    );

    // ========================= Render =========================
    return (
        <div className={`${prefixCls}-root`}>
            <Mask
                prefixCls={prefixCls}
                visible={mask && visible}
                motionName={getMotionName(prefixCls, maskTransitionName, maskAnimation)}
                style={{
                    zIndex,
                    ...maskStyle,
                }}
                maskProps={maskProps}
            />
            <div
                tabIndex={-1}
                onKeyDown={onWrapperKeyDown}
                className={classNames(`${prefixCls}-wrap`, wrapClassName)}
                ref={wrapperRef}
                onClick={onWrapperClick}
                role="dialog"
                aria-labelledby={title ? ariaIdRef.current : null}
                style={{ zIndex, ...wrapStyle, display: !animatedVisible ? 'none' : null }}
                {...wrapProps}
            >
                <Content
                    {...props}
                    onClick={onContentClick}
                    ref={contentRef}
                    closable={closable}
                    ariaId={ariaIdRef.current}
                    prefixCls={prefixCls}
                    visible={visible}
                    onClose={onInternalClose}
                    onVisibleChanged={onDialogVisibleChanged}
                    motionName={getMotionName(prefixCls, transitionName, animation)}
                />
            </div>
        </div>
    );
}
