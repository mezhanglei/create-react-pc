import React, { Component } from 'react';
import { Scroll, Event } from './base/index';
import { autobind } from 'core-decorators';
import Loading from '@/components/loading-animation/dot-loading';
import './scroll.less';

@autobind
class ScrollView extends Component {
    static defaultProps = {
        requestErrorTime: 10000,
        pullDownTime: 200,
        pullDownBounceTime: 0,
        pullDownContent: '释放刷新',
        showLoading: true,
        finishUpContent: '没有更多数据了',
        errorContent: '加载失败，点击重试',
        customNoData: false, // 自定义一条数据都没有的样式。一般是配合没有数据时，有数据之后，一定要置为false，否则上拉会出现问题
    };

    constructor(props) {
        super(props);
        this.scrollRef = React.createRef();
        this.scroll = null;
        this.isBouncing = false;
        this.firstIntoPage = false;
        this.requestErrorTimer = 0;
        this.pullDownTimer = 0;
        this.pullDownBounceTimer = 0;

        this.state = {
            isFinishUp: false,
            isBeforePullDown: false,
            isPullingDown: false,
            isPullingUp: false,
            isPullUpError: false,
        };
    }

    componentDidMount() {
        const { height, isUseBodyScroll, up, down, isLockX, throttle, throttleTime } = this.props;
        const container = this.scrollRef.current;
        this.scroll = new Scroll({
            container,
            isLockX,
            isUseBodyScroll,
            throttleTime,
            throttle,
            up,
            down,
        });
        if (!isUseBodyScroll) {
            container.style.height = height ? `${height}px` : '100vh';
        }
        this.initEvent();
    }

    componentWillUnmount() {
        if (this.scroll) this.scroll.destroy();
        clearTimeout(this.pullDownTimer);
        clearTimeout(this.pullDownBounceTimer);
        clearTimeout(this.requestErrorTimer);
    }

    endPullUp(bol = true) {
        this.setState({ isFinishUp: bol });
        this.scroll?.endPullUp(bol);
    }

    initEvent() {
        this.scroll?.on(Event.PULL_UP, this.pullUp);
        this.scroll?.on(Event.PULLING_DOWN, this.pullingDown);
        this.scroll?.on(Event.PULL_DOWN, this.pullDown);
        this.scroll?.on(Event.CANCEL_PULL_DOWN, this.cancelPullDown);
    }

    cancelPullDown() {
        this.setState({ isBeforePullDown: false });
    }

    pullingDown(height) {
        if (this.isBouncing || height <= 0) return;
        this.setState({ isBeforePullDown: true });
    }

    pullDown() {
        const { pullDown, pullDownTime } = this.props;
        if (!pullDown || this.isBouncing) return;

        this.cancelPullUp();

        this.isBouncing = true;
        this.setState({
            isPullingDown: true,
            isFinishUp: false,
            isBeforePullDown: false,
            isPullUpError: false,
        });

        const PromiseSuccessCallback = (finishUp) => {
            clearTimeout(this.pullDownTimer);
            this.pullDownTimer = window.setTimeout(() => {
                this.setState({ isPullingDown: false });
                this.endPullUp(finishUp);
                this.afterPullDown(finishUp);
            }, pullDownTime);
        };

        this.handleRequestError(pullDown)
            .then(PromiseSuccessCallback)
            .catch(() => {
                this.setState({ isPullUpError: true });
            });
    }

    cancelPullUp() {
        if (!this.state.isPullingUp) return;
        this.setState({ isPullingUp: false });
        this.endPullUp(false);
    }

    afterPullDown(finishUp) {
        const { pullDownBounceTime } = this.props;
        clearTimeout(this.pullDownBounceTimer);
        this.pullDownBounceTimer = window.setTimeout(() => {
            this.isBouncing = false;
            (this.scroll).endPullDown(finishUp);
        }, pullDownBounceTime);
    }

    pullUp(showLoading) {
        const { pullUp } = this.props;
        console.log(pullUp)
        const { isPullingUp, isFinishUp } = this.state;
        if (!pullUp || isPullingUp || isFinishUp) return;

        if (showLoading) this.setState({ isPullingUp: true });

        const PromiseSuccessCallback = (finishUp) => {
            if (this.firstIntoPage) this.firstIntoPage = false;
            if (showLoading) this.setState({ isPullingUp: false });
            this.endPullUp(finishUp);
            !finishUp && this.scroll?.resetPullUp();
        };

        this.handleRequestError(pullUp)
            .then(PromiseSuccessCallback)
            .catch(() => {
                this.setState({ isPullingUp: false, isPullUpError: true });
            });
    }

    async handleRequestError(fn) {
        const errorPromise = new Promise((resolve, reject) => {
            clearTimeout(this.requestErrorTimer);
            this.requestErrorTimer = window.setTimeout(() => {
                Scroll.info('request callback error');
                reject(Error('error'));
            }, this.props.requestErrorTime);
        });
        const res = await Promise.race([fn(), errorPromise]);
        clearTimeout(this.requestErrorTimer);
        return res;
    }

    // Todo 上拉失败之后发起重试
    pullUpRetry() {

    }

    renderPullDown() {
        const { pullDownContent } = this.props;
        const { isBeforePullDown, isPullingDown } = this.state;
        return (
            <div className="scroll-view-down">
                <div className="scroll-view-down-content" style={{ display: isBeforePullDown ? 'block' : 'none' }}>
                    {pullDownContent}
                </div>
                <div className="scroll-view-down-loading" style={{ display: !isBeforePullDown && isPullingDown ? 'block' : 'none' }}>
                    <Loading />
                </div>
            </div>
        );
    }

    renderPullUp() {
        const { customNoData, errorContent, finishUpContent, showLoading } = this.props;
        const { isPullUpError, isBeforePullDown, isPullingDown, isFinishUp, isPullingUp } = this.state;

        // loading第一次不加载，下拉情况下需要隐藏上拉元素
        if ((this.firstIntoPage && !showLoading) || customNoData) return null;
        return (
            <div className="scroll-view-up" style={{ display: isBeforePullDown || isPullingDown ? 'none' : 'flex' }}>
                <div
                    className="scroll-view-up-content"
                    style={{ display: isFinishUp ? 'block' : 'none' }}
                >
                    {finishUpContent}
                </div>
                <div
                    className="scroll-view-up-loading"
                    style={{ display: isPullingUp ? 'block' : 'none' }}
                >
                    <Loading />
                </div>
                <div
                    className="scroll-view-error"
                    onClick={this.pullUpRetry}
                    style={{ display: isPullUpError && !isFinishUp && !isPullingUp ? 'block' : 'none' }}
                >
                    {errorContent}
                </div>
            </div>
        );
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    render() {
        const { pullUp, pullDown, children } = this.props;
        return (
            <div className="scroll-view" ref={this.scrollRef}>
                <div className="scroll-view-container">
                    {pullDown && this.renderPullDown()}
                    {children}
                    {pullUp && this.renderPullUp()}
                </div>
            </div>
        );
    }
}

export default ScrollView;
