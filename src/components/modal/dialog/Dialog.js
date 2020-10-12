import * as React from 'react';
import * as ReactDOM from 'react-dom';
import KeyCode from 'rc-util/lib/KeyCode';
import contains from 'rc-util/lib/Dom/contains';
import Animate from 'rc-animate';
import LazyRenderBox from './LazyRenderBox';
import { getPositionInPage } from "@/utils/dom";
import { getPrefixStyle } from '@/utils/cssPrefix';

let uuid = 0;

export default class Dialog extends React.Component {
    static defaultProps = {
        className: '',
        mask: true,
        visible: false,
        keyboard: true,
        closable: true,
        maskClosable: true,
        destroyOnClose: false,
        prefixCls: 'rc-dialog',
        focusTriggerAfterClose: true,
    };

    constructor(props) {
        super(props);
        this.titleId = `rcDialogTitle${uuid++}`;
        this.switchScrollingEffect = props.switchScrollingEffect || (() => { });
    }

    componentDidMount() {
        this.componentDidUpdate({});
        // if forceRender is true, set element style display to be none;
        if (
            (this.props.forceRender || (this.props.getContainer === false && !this.props.visible)) &&
            this.wrap
        ) {
            this.wrap.style.display = 'none';
        }
    }

    componentDidUpdate(prevProps) {
        const { visible, mask, focusTriggerAfterClose } = this.props;
        const mousePosition = this.props.mousePosition;
        if (visible) {
            // first show
            if (!prevProps.visible) {
                this.openTime = Date.now();
                this.switchScrollingEffect();
                this.tryFocus();
                const dialogNode = ReactDOM.findDOMNode(this.dialog);
                if (mousePosition) {
                    const elOffset = getPositionInPage(dialogNode);
                    dialogNode.style[getPrefixStyle("transformOrigin")] = `${mousePosition.x - elOffset.left}px ${mousePosition.y - elOffset.top}px`;
                } else {
                    dialogNode.style[getPrefixStyle("transformOrigin")] = "";
                }
            }
        } else if (prevProps.visible) {
            this.inTransition = true;
            if (mask && this.lastOutSideFocusNode && focusTriggerAfterClose) {
                try {
                    this.lastOutSideFocusNode.focus();
                } catch (e) {
                    this.lastOutSideFocusNode = null;
                }
                this.lastOutSideFocusNode = null;
            }
        }
    }

    componentWillUnmount() {
        const { visible, getOpenCount } = this.props;
        if ((visible || this.inTransition) && !getOpenCount()) {
            this.switchScrollingEffect();
        }
        clearTimeout(this.timeoutId);
    }

    tryFocus() {
        if (!contains(this.wrap, document.activeElement)) {
            this.lastOutSideFocusNode = document.activeElement;
            this.sentinelStart.focus();
        }
    }

    onAnimateLeave = () => {
        const { afterClose } = this.props;
        // need demo?
        // https://github.com/react-component/dialog/pull/28
        if (this.wrap) {
            this.wrap.style.display = 'none';
        }
        this.inTransition = false;
        this.switchScrollingEffect();
        if (afterClose) {
            afterClose();
        }
    }

    onDialogMouseDown = () => {
        this.dialogMouseDown = true;
    }

    onMaskMouseUp = () => {
        if (this.dialogMouseDown) {
            this.timeoutId = setTimeout(() => {
                this.dialogMouseDown = false;
            }, 0);
        }
    }

    onMaskClick = (e) => {
        // android trigger click on open (fastclick??)
        if (Date.now() - this.openTime < 300) {
            return;
        }
        if (e.target === e.currentTarget && !this.dialogMouseDown) {
            this.close(e);
        }
    }

    onKeyDown = (e) => {
        const props = this.props;
        if (props.keyboard && e.keyCode === KeyCode.ESC) {
            e.stopPropagation();
            this.close(e);
            return;
        }
        // keep focus inside dialog
        if (props.visible) {
            if (e.keyCode === KeyCode.TAB) {
                const activeElement = document.activeElement;
                const sentinelStart = this.sentinelStart;
                if (e.shiftKey) {
                    if (activeElement === sentinelStart) {
                        this.sentinelEnd.focus();
                    }
                } else if (activeElement === this.sentinelEnd) {
                    sentinelStart.focus();
                }
            }
        }
    }

    getDialogElement = () => {
        const props = this.props;
        const closable = props.closable;
        const prefixCls = props.prefixCls;
        const dest = {};
        if (props.width !== undefined) {
            dest.width = props.width;
        }
        if (props.height !== undefined) {
            dest.height = props.height;
        }

        let footer;
        if (props.footer) {
            footer = (
                <div className={`${prefixCls}-footer`} ref={this.saveRef('footer')}>
                    {props.footer}
                </div>
            );
        }

        let header;
        if (props.title) {
            header = (
                <div className={`${prefixCls}-header`} ref={this.saveRef('header')}>
                    <div className={`${prefixCls}-title`} id={this.titleId}>
                        {props.title}
                    </div>
                </div>
            );
        }

        let closer;
        if (closable) {
            closer = (
                <button
                    type="button"
                    onClick={this.close}
                    aria-label="Close"
                    className={`${prefixCls}-close`}
                >
                    {props.closeIcon || <span className={`${prefixCls}-close-x`} />}
                </button>
            );
        }

        const style = { ...props.style, ...dest };
        const sentinelStyle = { width: 0, height: 0, overflow: 'hidden', outline: 'none' };
        const transitionName = this.getTransitionName();
        const dialogElement = (
            <LazyRenderBox
                key="dialog-element"
                role="document"
                ref={this.saveRef('dialog')}
                style={style}
                className={`${prefixCls} ${props.className || ''}`}
                visible={props.visible}
                forceRender={props.forceRender}
                onMouseDown={this.onDialogMouseDown}
            >
                <div
                    tabIndex={0}
                    ref={this.saveRef('sentinelStart')}
                    style={sentinelStyle}
                    aria-hidden="true"
                />
                <div className={`${prefixCls}-content`}>
                    {closer}
                    {header}
                    <div
                        className={`${prefixCls}-body`}
                        style={props.bodyStyle}
                        ref={this.saveRef('body')}
                        {...props.bodyProps}
                    >
                        {props.children}
                    </div>
                    {footer}
                </div>
                <div
                    tabIndex={0}
                    ref={this.saveRef('sentinelEnd')}
                    style={sentinelStyle}
                    aria-hidden="true"
                />
            </LazyRenderBox>
        );

        return (
            <Animate
                key="dialog"
                showProp="visible"
                onLeave={this.onAnimateLeave}
                transitionName={transitionName}
                component=""
                transitionAppear
            >
                {props.visible || !props.destroyOnClose ? dialogElement : null}
            </Animate>
        );
    }

    getZIndexStyle = () => {
        const style = {};
        const props = this.props;
        if (props.zIndex !== undefined) {
            style.zIndex = props.zIndex;
        }
        return style;
    }

    getWrapStyle = () => {
        return { ...this.getZIndexStyle(), ...this.props.wrapStyle };
    }

    getMaskStyle = () => {
        return { ...this.getZIndexStyle(), ...this.props.maskStyle };
    }

    getMaskElement = () => {
        const props = this.props;
        let maskElement;
        if (props.mask) {
            const maskTransition = this.getMaskTransitionName();
            maskElement = (
                <LazyRenderBox
                    style={this.getMaskStyle()}
                    key="mask"
                    className={`${props.prefixCls}-mask`}
                    hiddenClassName={`${props.prefixCls}-mask-hidden`}
                    visible={props.visible}
                    {...props.maskProps}
                />
            );
            if (maskTransition) {
                maskElement = (
                    <Animate
                        key="mask"
                        showProp="visible"
                        transitionAppear
                        component=""
                        transitionName={maskTransition}
                    >
                        {maskElement}
                    </Animate>
                );
            }
        }
        return maskElement;
    }

    getMaskTransitionName = () => {
        const props = this.props;
        let transitionName = props.maskTransitionName;
        const animation = props.maskAnimation;
        if (!transitionName && animation) {
            transitionName = `${props.prefixCls}-${animation}`;
        }

        return transitionName;
    }

    getTransitionName = () => {
        const props = this.props;
        let transitionName = props.transitionName;
        const animation = props.animation;
        if (!transitionName && animation) {
            transitionName = `${props.prefixCls}-${animation}`;
        }
        return transitionName;
    }

    close = (e) => {
        const { onClose } = this.props;
        if (onClose) {
            onClose(e);
        }
    }

    saveRef = (name) => (node) => {
        this[name] = node;
    }

    render() {
        const { props } = this;
        const { prefixCls, maskClosable } = props;
        const style = this.getWrapStyle();
        // clear hide display
        // and only set display after async anim, not here for hide
        if (props.visible) {
            style.display = null;
        }
        return (
            <div className={`${prefixCls}-root`}>
                {this.getMaskElement()}
                <div
                    tabIndex={-1}
                    onKeyDown={this.onKeyDown}
                    className={`${prefixCls}-wrap ${props.wrapClassName || ''}`}
                    ref={this.saveRef('wrap')}
                    onClick={maskClosable ? this.onMaskClick : null}
                    onMouseUp={maskClosable ? this.onMaskMouseUp : null}
                    role="dialog"
                    aria-labelledby={props.title ? this.titleId : null}
                    style={style}
                    {...props.wrapProps}
                >
                    {this.getDialogElement()}
                </div>
            </div>
        );
    }
}
