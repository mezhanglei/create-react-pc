import React, { Component } from 'react';
import { throttle } from '@/utils/common';
import { ThresholdUnits, parseThreshold } from './utils/threshold';
import Raf from "@/utils/requestAnimationFrame";
import { isTouch } from "@/utils/reg";

export default class InfiniteScroll extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showLoader: false,
            canPullFresh: false,
        };
        this.pullAreaHeight = 0;
        this.throttledOnScrollListener = this.onScrollListener;
        this.onStart = this.onStart.bind(this);
        this.onMove = this.onMove.bind(this);
        this.onEnd = this.onEnd.bind(this);
    }

    lastScrollTop = 0;
    actionTriggered = false;
    dragging = false;

    componentDidMount() {
        if (typeof this.props.dataLength === 'undefined') {
            throw new Error(
                `mandatory prop "dataLength" is missing. The prop is needed` +
                ` when loading more content. Check README.md for usage`
            );
        }

        // 滚动根节点
        this._scrollableNode = this.getScrollableTarget();
        console.log(this._scrollableNode)
        this.el = this.props.height
            ? this.scrollContainer
            : this._scrollableNode || window;

        if (this.el) {
            this.el.addEventListener('scroll', this
                .throttledOnScrollListener);
        }

        if (
            typeof this.props.initialScrollY === 'number' &&
            this.el &&
            this.el instanceof HTMLElement &&
            this.el.scrollHeight > this.props.initialScrollY
        ) {
            this.el.scrollTo(0, this.props.initialScrollY);
        }

        if (this.props.pullDownToRefresh && this.el) {
            this.el.addEventListener('touchstart', this.onStart);
            this.el.addEventListener('touchmove', this.onMove);
            this.el.addEventListener('touchend', this.onEnd);

            this.el.addEventListener('mousedown', this.onStart);
            this.el.addEventListener('mousemove', this.onMove);
            this.el.addEventListener('mouseup', this.onEnd);

            // get BCR of pullDown element to position it above
            this.pullAreaHeight = this.pullArea?.firstChild?.getBoundingClientRect()?.height || 0;
            // this.forceUpdate();
        }
    }

    componentWillUnmount() {
        if (this.el) {
            this.el.removeEventListener('scroll', this
                .throttledOnScrollListener);

            if (this.props.pullDownToRefresh) {
                this.el.removeEventListener('touchstart', this.onStart);
                this.el.removeEventListener('touchmove', this.onMove);
                this.el.removeEventListener('touchend', this.onEnd);

                this.el.removeEventListener('mousedown', this.onStart);
                this.el.removeEventListener('mousemove', this.onMove);
                this.el.removeEventListener('mouseup', this.onEnd);
                // 取消raf
                Raf.cancelRaf(this.resetDrag);
            }
        }
    }

    // 获取事件对象的位置
    getEventPosition = (e) => {
        e = e || window.event;
        return {
            x: isTouch() ? e.touches[0].clientX : e.clientX,
            y: isTouch() ? e.touches[0].clientY : e.clientY
        };
    }

    UNSAFE_componentWillReceiveProps(props) {
        // do nothing when dataLength is unchanged
        if (this.props.dataLength === props.dataLength) return;

        this.actionTriggered = false;
        // update state when new data was sent in
        this.setState({
            showLoader: false,
        });
    }

    // 获取滚动的根节点
    getScrollableTarget = () => {
        const { height } = this.props;
        if (this.props.scrollableTarget instanceof HTMLElement && height) {
            return this.props.scrollableTarget;
        } else if (typeof this.props.scrollableTarget === 'string' && height) {
            return document.querySelector(this.props.scrollableTarget);
        } else if (height) {
            return this.scrollContainer;
        }
        return (document.body || document.documentElement);
    };

    onStart = (evt) => {
        if (this.lastScrollTop) return;

        this.dragging = true;

        // if (evt instanceof MouseEvent) {
        //     this.startY = evt.pageY;
        // } else if (evt instanceof TouchEvent) {
        //     this.startY = evt.touches[0].pageY;
        // }
        this.setState({
            preStartY: this.getEventPosition(evt).y
        });

        if (this.scrollContainer) {
            this.scrollContainer.style.willChange = 'transform';
            this.scrollContainer.style.transition = `transform 0.2s cubic-bezier(0,0,0.31,1)`;
        }
    };

    onMove = (evt) => {
        if (!this.dragging) return;

        const startY = this.getEventPosition(evt).y;
        const { preStartY } = this.state;
        const { minPullDown } = this.props;

        if (startY < preStartY) return;

        if (startY - preStartY >= minPullDown) {
            this.setState({
                canPullFresh: true
            });
        }

        if (this.scrollContainer) {
            this.scrollContainer.style.overflow = 'visible';
            this.scrollContainer.style.transform = `translate3d(0px, ${startY - preStartY}px, 0px)`;
        }
    };

    onEnd = () => {

        if (typeof this.props.refreshFunction !== 'function') {
            throw new Error(`"refreshFunction" is not function or missing`);
        }

        if (this.state.canPullFresh) {
            this.props.refreshFunction && this.props.refreshFunction();
            this.setState({
                canPullFresh: false,
            });
        }

        Raf.setRaf(this.resetDrag);

        this.setState({
            startY: 0,
            preStartY: 0
        });
        this.dragging = false;
    };

    // 重置样式
    resetDrag = () => {
        if (this.scrollContainer) {
            this.scrollContainer.style.overflow = 'auto';
            this.scrollContainer.style.transform = 'none';
            this.scrollContainer.style.willChange = 'none';
        }
    }

    canPullDown = () => {
        const {
            refreshFunction,
            disabledFresh
        } = this.props;

        if (
            typeof refreshFunction != "function" ||
            disabledFresh
        ) {
            return false;
        }

        return true;
    }

    isElementAtTop(target, loadingDistance = 0.8) {
        const clientHeight =
            target === document.body || target === document.documentElement
                ? window.screen.availHeight
                : target.clientHeight;

        const threshold = parseThreshold(loadingDistance);

        if (threshold.unit === ThresholdUnits.Pixel) {
            return (
                target.scrollTop <=
                threshold.value + clientHeight - target.scrollHeight + 1 ||
                target.scrollTop === 0
            );
        }

        return (
            target.scrollTop <=
            threshold.value / 100 + clientHeight - target.scrollHeight + 1 ||
            target.scrollTop === 0
        );
    }

    isElementAtBottom(target, loadingDistance = 0.8) {
        const clientHeight =
            target === document.body || target === document.documentElement
                ? window.screen.availHeight
                : target.clientHeight;

        const threshold = parseThreshold(loadingDistance);

        if (threshold.unit === ThresholdUnits.Pixel) {
            return (
                target.scrollTop + clientHeight >= target.scrollHeight - threshold.value
            );
        }

        return (
            target.scrollTop + clientHeight >=
            (threshold.value / 100) * target.scrollHeight
        );
    }

    onScrollListener = (event) => {
        const {
            onScroll,
            inverse
        } = this.props;
        if (typeof onScroll === 'function') {
            setTimeout(() => onScroll && onScroll(event), 0);
        }

        if (this.actionTriggered) return;

        const target = this.getScrollableTarget();

        const atBottom = inverse
            ? this.isElementAtTop(target, this.props.loadingDistance)
            : this.isElementAtBottom(target, this.props.loadingDistance);

        // call the `next` function in the props to trigger the next data fetch
        if (atBottom && this.props.hasMore) {
            this.actionTriggered = true;
            this.setState({ showLoader: true });
            this.props.next && this.props.next();
        }

        this.lastScrollTop = target.scrollTop;
    };

    render() {
        const style = {
            height: this.props.height || 'auto',
            overflow: 'auto',
            WebkitOverflowScrolling: 'touch',
            ...this.props.style,
        };
        const hasChildren =
            this.props.hasChildren ||
            !!(
                this.props.children &&
                this.props.children instanceof Array &&
                this.props.children.length
            );

        // because heighted infiniteScroll visualy breaks
        // on drag down as overflow becomes visible
        const outerDivStyle =
            this.props.pullDownToRefresh && this.props.height
                ? { overflow: 'auto' }
                : {};
        return (
            <div
                style={outerDivStyle}
                className="infinite-scroll-component__outerdiv"
            >
                <div
                    className={`infinite-scroll-component ${this.props.className || ''}`}
                    ref={(node) => (this.scrollContainer = node)}
                    style={style}
                >
                    {this.props.pullDownToRefresh && (
                        <div
                            style={{ position: 'relative' }}
                            ref={(node) => (this.pullArea = node)}
                        >
                            <div
                                style={{
                                    position: 'absolute',
                                    left: 0,
                                    right: 0,
                                    top: -1 * this.pullAreaHeight
                                }}
                            >
                                {this.state.canPullFresh
                                    ? this.props.releaseToRefreshContent
                                    : this.props.pullDownToRefreshContent}
                            </div>
                        </div>
                    )}
                    {this.props.children}
                    {!this.state.showLoader &&
                        !hasChildren &&
                        this.props.hasMore &&
                        this.props.loader}
                    {this.state.showLoader && this.props.hasMore && this.props.loader}
                    {!this.props.hasMore && this.props.endMessage}
                </div>
            </div>
        );
    }
}
