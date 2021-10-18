import React, { useEffect, useState, useRef, ReactNode, CSSProperties } from 'react';
import { throttle } from './utils/common';
import { ThresholdUnits, parseThreshold } from './utils/threshold';
import Raf from "./utils/requestAnimationFrame";
import { setScroll, getScroll, getOffsetWH, getEventPosition, getScrollParent, addEvent, removeEvent } from "./utils/dom";
import { isDom } from "./utils/type";
import { isMobile } from './utils/verify';

type fn = () => any;
type EventType = MouseEvent | TouchEvent;

export enum COMPONENT_TYPE {
    PULL = "pullDown",
    RELEASE = "release",
    REFRESHING = "refreshing",
    END = "refreshEnd"
}

export interface Props {
    height?: number; // 设置固定高度滚动
    containerStyle?: CSSProperties; // 组件内部的style样式
    pullDownToRefresh?: boolean; // 是否下拉刷新
    releaseComponent?: ReactNode; // 释放下拉时的提示组件
    pullDownComponent?: ReactNode; // 下拉时的提示组件
    refreshingComponent?: ReactNode; // 刷新中的提示组件
    refreshEndComponent?: ReactNode; // 刷新结束时的提示组件
    endComponent?: ReactNode; // 数据加载完了展示的组件
    loadingComponent?: ReactNode; // 加载时的展示组件
    hasMore?: boolean; // 控制是否还进行加载
    errorComponent?: ReactNode; // 加载出错时的展示组件
    className?: string; // 
    onScroll?: (e: EventType) => any; // 滚动监听函数
    inverse?: boolean; // 反向滚动加载
    thresholdValue?: number | string; // 阈值,用来控制滚动到什么程度(距离)触发加载
    next: fn; // 加载新数据时函数
    refreshFunction?: fn; // 刷新列表的方法
    minPullDown?: number; // 下拉刷新时, 最小下拉高度
    maxPullDown?: number; // 下拉刷新时, 最大下拉高度
    scrollableParent?: HTMLElement | Element | null; // 不设置则默认自动搜索滚动父元素， 设置在该父元素内滚动，建议设置以节省性能，设置forbidTrigger可以阻止滚动触发
    isError?: boolean; // 是否加载出错
    forbidTrigger?: boolean; // 禁止滚动加载触发，当页面上有多个滚动列表且滚动父元素相同，则可以通过此api禁止滚动触发加载
    children: any;
    length?: number;
};

export interface ScrollRef {
    scrollTo: (x: number, y: number) => void;
    getScrollRef: () => any;
}

export enum ScrollDirection {
    UP = "up",
    DOWN = "down"
}

// Simple abstraction for dragging events names.
const eventsFor = {
    touch: {
        start: 'touchstart',
        move: 'touchmove',
        stop: 'touchend'
    },
    mouse: {
        start: 'mousedown',
        move: 'mousemove',
        stop: 'mouseup'
    }
};

// 根据当前设备看是否触发
let dragEventFor = isMobile() ? eventsFor.touch : eventsFor.mouse;


export default class InfiniteScroll extends React.Component<Props, {}> {
    scrollWrap?: HTMLElement;
    childrenWrap?: HTMLElement;
    event: any;
    scrollRoot?: HTMLElement;
    dragging: boolean;
    scrollY: number;
    length: number;
    constructor(props: Props) {
        super(props);
        this.dragging = false;
        this.scrollY = 0;
        this.length = 0;
        this.state = {
            refreshType: COMPONENT_TYPE.PULL,
            loading: false,
            isError: false,
            scrollHeight: 0,
            pullDistance: 0,
            length: 0
        };
    }

    static defaultProps = {
        minPullDown: 10,
        maxPullDown: 50
    }

    componentDidMount() {
        this.scrollRoot = this.getScrollableTarget();
        // 绑定事件
        const {
            scrollableParent,
            height
        } = this.props;
        const target = this.scrollRoot;
        if (target) {
            this.initDom(target);
            // 节点设置警告
            if (scrollableParent && height) {
                console.error(`"scrollableParent" and "height" only need one`);
            }
        }
    }

    componentWillUnmount() {
        this.removeEvents()
    }

    removeEvents = () => {
        const {
            pullDownToRefresh
        } = this.props;
        const event = this.event;
        if (event) {
            const throttledOnScrollListener = throttle(this.onScrollListener);
            removeEvent(event, 'scroll', throttledOnScrollListener);

            if (pullDownToRefresh) {
                removeEvent(event, dragEventFor.start, this.onStart);
                removeEvent(event, dragEventFor.move, this.onMove);
                removeEvent(document, dragEventFor.stop, this.onEnd);
                // 取消raf
                Raf.cancelRaf(this.resetDrag);
            }
        }
    };

    // 获取滚动的父节点
    getScrollableTarget = (): any => {
        const scrollContainerDom = this.scrollWrap;
        const scrollableParent = this.props.scrollableParent;
        if (isDom(scrollableParent)) {
            return scrollableParent;
        } else if (typeof scrollableParent === 'string') {
            return document.querySelector(scrollableParent);
        } else if (this.props.height) {
            return scrollContainerDom;
        } else {
            const target = getScrollParent(scrollContainerDom);
            return target;
        }
    };

    // 初始化绑定事件(滚动节点可能是异步也可能是同步)
    initDom = (scrollableParent: HTMLElement) => {
        const {
            pullDownToRefresh,
            forbidTrigger
        } = this.props;
        if (forbidTrigger) return;
        // 滚动父节点绑定事件(文档根节点不能绑定事件)
        const el: any = [document.documentElement, document.body].includes(scrollableParent) ? (document || window) : scrollableParent;
        this.event = el;

        if (el) {
            const throttledOnScrollListener = throttle(this.onScrollListener);
            addEvent(el, 'scroll', throttledOnScrollListener);
        }

        if (pullDownToRefresh && el) {
            addEvent(document, dragEventFor.start, this.onStart);
            addEvent(document, dragEventFor.move, this.onMove);
            addEvent(document, dragEventFor.stop, this.onEnd);
        }
    };

    componentWillMount() {
        this.loadMore()
    }

    loadMore = () => {
        // 加载下一个列表时重置状态
        const {
            length
        } = this.props;
        const target = this.scrollRoot;
        if (!target) return;
        if (length) {
            if (this.length !== 0) {
                this.resetStatus(target);
            }
            this.length = length;
        }
        this.setState({
            scrollHeight: target.scrollHeight
        })
    }

    // 加载到新数据后重置状态
    resetStatus = (target: any) => {
        const {
            inverse,
            thresholdValue
        } = this.props;
        const {
            loading,
            scrollHeight,
        } = this.state;
        // 反向加载的时候需要重置滚动高度
        if (inverse && loading && this.isElementAtTop(target, thresholdValue)) {
            setScroll(target, 0, (scrollHeight && target.scrollHeight - scrollHeight) ? target.scrollHeight - scrollHeight : 50);
        }
        // 结束触发
        // 结束loading
        // 结束error状态
        // 设置加载状态
        this.setState({
            finishTrigger: false,
            loading: false,
            isError: false,
            refreshType: COMPONENT_TYPE.END
        })
    };

    // 监听滚动事件
    onScrollListener = (event: EventType) => {
        const { onScroll, inverse, thresholdValue, hasMore, next, forbidTrigger } = this.props;
        const {
            finishTrigger,
            isError
        } = this.state;
        if (typeof onScroll === 'function') {
            setTimeout(() => onScroll && onScroll(event), 0);
        }

        if (finishTrigger || forbidTrigger || isError) return;

        const target = this.scrollRoot;
        const atBottom = inverse
            ? this.isElementAtTop(target, thresholdValue)
            : this.isElementAtBottom(target, thresholdValue);

        // 加载数据
        if (atBottom && hasMore) {
            this.setState({
                loading: true,
                finishTrigger: true
            })
            next && next();
        }
    };

    // 是否在顶部
    isElementAtTop = (target: HTMLElement, thresholdValue: number | string = 0.8) => {
        const scrollTop = getScroll(target)?.y || 0;
        const threshold = parseThreshold(thresholdValue);

        if (threshold.unit === ThresholdUnits.Pixel) {
            return (
                scrollTop <= threshold.value
            );
        }

        return scrollTop <= 20;
    };

    // 是否在底部
    isElementAtBottom = (target: HTMLElement, thresholdValue: number | string = 0.8) => {
        const clientHeight = getOffsetWH(target)?.height || 0;
        const scrollTop = getScroll(target)?.y || 0;
        const threshold = parseThreshold(thresholdValue);

        if (threshold.unit === ThresholdUnits.Pixel) {
            return (
                scrollTop + clientHeight >= target.scrollHeight - threshold.value
            );
        }

        return (
            scrollTop + clientHeight >=
            (threshold.value / 100) * target.scrollHeight
        );
    };

    onStart = (evt: EventType) => {
        const {
            inverse,
            thresholdValue
        } = this.props;
        const condition = inverse ? !this.isElementAtBottom(this.scrollRoot, thresholdValue) : !this.isElementAtTop(this.scrollRoot, thresholdValue);
        if (condition) return;
        this.dragging = true;
        this.scrollY = getEventPosition(evt)?.y || 0;
        const scrollContainerDom = this.scrollWrap;
        if (scrollContainerDom) {
            scrollContainerDom.style.willChange = 'transform';
            scrollContainerDom.style.transition = `transform 0.2s cubic-bezier(0,0,0.31,1)`;
        }
    };

    onMove = (evt: EventType) => {
        if (!this.dragging) return;
        const {
            minPullDown,
            maxPullDown,
            inverse
        } = this.props;
        if (minPullDown > maxPullDown) {
            console.warn(`"minPullDown" is large than "maxPullDown", please set "maxPullDown" and "maxPullDown" should large than "minPullDown"`);
            return;
        }

        const minHeight = minPullDown;
        const maxHeight = maxPullDown;

        const startY = getEventPosition(evt)?.y || 0;
        const deltaY = startY - this.scrollY;

        if (inverse) {
            if (deltaY < 0) {
                const num = Math.max(deltaY, -maxHeight);
                this.setState({
                    pullDistance: num
                })
                Raf.setRaf(() => this.setDrag(num));
            }
        } else {
            if (deltaY > 0) {
                const num = Math.min(deltaY, maxHeight)
                this.setState({
                    pullDistance: num
                })
                Raf.setRaf(() => this.setDrag(num));
            }
        }

        // 最小判断边界
        if (Math.abs(deltaY) >= minHeight) {
            this.setState({
                refreshType: COMPONENT_TYPE.RELEASE
            })
        } else {
            this.setState({
                refreshType: COMPONENT_TYPE.PULL
            })
        }
    };

    onEnd = (evt: EventType) => {
        const {
            refreshFunction
        } = this.props;
        const {
            pullDistance
        } = this.props;
        if (typeof refreshFunction !== 'function') {
            throw new Error(`"refreshFunction" is not function or missing`);
        }
console.log(pullDistance)
        this.dragging = false;
        if (Math.abs(pullDistance) > 0) {
            this.setState({
                refreshType: COMPONENT_TYPE.REFRESHING
            })
            refreshFunction && refreshFunction();
            Raf.setRaf(this.resetDrag);
            this.scrollY = 0;
            this.setState({
                pullDistance: 0
            })
        }
    };

    resetDrag = () => {
        const childrenContainer = this.childrenWrap;
        if (childrenContainer) {
            childrenContainer.style.transform = 'none';
            childrenContainer.style.willChange = 'none';
        }
    };

    setDrag = (move: number) => {
        const childrenContainer = this.childrenWrap;
        if (childrenContainer) {
            childrenContainer.style.transition = `transform 0.2s cubic-bezier(0,0,0.31,1)`;
            childrenContainer.style.transform = `translate3d(0px, ${move}px, 0px)`;
        }
    };

    render() {
        const {
            children,
            pullDownToRefresh,
            height,
            containerStyle,
            hasMore,
            loadingComponent,
            errorComponent,
            endComponent,
            pullDownComponent,
            releaseComponent,
            refreshingComponent,
            refreshEndComponent,
            inverse,
            className
        } = this.props;
        const {
            loading,
            isError,
            pullDistance,
            refreshType
        } = this.state;
        const hasChildren = !!(children);

        // 当设置了滚动固定高度, 下拉/上拉刷新时阻止元素溢出到外面显示
        const outerDivStyle: CSSProperties = pullDownToRefresh && height
            ? { overflow: 'hidden' }
            : {};

        // 当组件滚动的容器在外部（即设置了scrollableParent），则设置overflow: hidden, 以免组件内部出现滚动条
        const insideStyle: CSSProperties = {
            height: height || 'auto',
            overflow: height ? 'auto' : "hidden",
            WebkitOverflowScrolling: 'touch',
            ...containerStyle,
        };

        // 加载更多相关组件
        const loadingMoreComponent = (
            <>
                {(loading || (!loading && !hasChildren)) && hasMore && !isError && loadingComponent}
                {isError && errorComponent}
                {!hasMore && !isError && endComponent}
            </>
        );

        // 下拉刷新的相关组件
        const refreshProps: any = {
            [COMPONENT_TYPE.PULL]: pullDownComponent,
            [COMPONENT_TYPE.RELEASE]: releaseComponent,
            [COMPONENT_TYPE.REFRESHING]: refreshingComponent,
            [COMPONENT_TYPE.END]: refreshEndComponent
        };

        const refreshComponent =
            pullDownToRefresh && (
                <div
                    style={{ display: (pullDistance || refreshType === COMPONENT_TYPE.REFRESHING) ? 'block' : 'none' }}
                >
                    <span>
                        {refreshProps[refreshType]}
                    </span>
                </div>
            );
        return (
            <div
                style={outerDivStyle}
                className="infinite-scroll-component__outerdiv"
            >
                <div
                    className={`infinite-scroll-component ${className || ''}`}
                    ref={node => this.scrollWrap = node}
                    style={insideStyle}
                >
                    <div ref={node => this.childrenWrap = node}>
                        {!inverse && refreshComponent}
                        {inverse && loadingMoreComponent}
                        {
                            React.Children.map(children, (child, index) => {
                                return React.cloneElement(React.Children.only(child), {
                                    style: { ...child.props.style }
                                });
                            })
                        }
                        {!inverse && loadingMoreComponent}
                        {inverse && refreshComponent}
                    </div>
                </div>
            </div>
        );
    }
}

// 滚动加载列表组件
// const InfiniteScroll = React.forwardRef<ScrollRef, Props>((props, ref) => {

//     const {
//         height,
//         containerStyle,
//         pullDownToRefresh,
//         releaseComponent,
//         pullDownComponent,
//         refreshingComponent,
//         refreshEndComponent,
//         endComponent,
//         loadingComponent,
//         hasMore,
//         errorComponent,
//         className,
//         onScroll,
//         inverse,
//         thresholdValue,
//         next,
//         refreshFunction,
//         minPullDown = 10,
//         maxPullDown = 50
//     } = props;

//     const [refreshType, setRefreshType] = useState<string>(COMPONENT_TYPE.PULL);
//     const [loading, setLoading] = useState<boolean>(false);
//     const [isError, setIsError] = useState<boolean | undefined>(false);
//     const [prevScrollHeight, setPrevScrollHeight] = useState<number>(0);
//     const [pullDistance, setPullDistance] = useState<number>(0);
//     const pullDistanceRef = useRef<number>(0);

//     const scrollContainerRef = useRef<HTMLDivElement>(null);
//     const scrollableRef = useRef<any>();
//     const childrenContainerRef = useRef<any>();
//     const eventRef = useRef<any>();
//     const errorRef = useRef<boolean>();
//     const loadNumRef = useRef<number>(0);
//     const finishTriggerRef = useRef<boolean>();
//     const forbidTriggerRef = useRef<boolean>();
//     const preStartYRef = useRef<number>(0);

//     let mouseDownRef = useRef<boolean>(false);

//     // ref转发实例方法
//     React.useImperativeHandle(ref, () => ({
//         scrollTo: (x: number, y: number) => {
//             setScroll(scrollableRef.current, x || 0, y || 0);
//         },
//         getScrollRef: () => (scrollableRef)
//     }));

//     // 获取滚动的父节点
//     const getScrollableTarget = (): any => {
//         const scrollContainerDom = scrollContainerRef.current;
//         const scrollableParent = props.scrollableParent;
//         if (isDom(scrollableParent)) {
//             return scrollableParent;
//         } else if (typeof scrollableParent === 'string') {
//             return document.querySelector(scrollableParent);
//         } else if (height) {
//             return scrollContainerDom;
//         } else {
//             const target = getScrollParent(scrollContainerDom);
//             return target;
//         }
//     };

//     // 当列表加载完成时, 再监听事件并重置一些状态
//     useEffect(() => {
//         // 绑定事件
//         const target = getScrollableTarget();
//         scrollableRef.current = target;
//         if (target) {
//             initDom(target);
//             // 节点设置警告
//             if (props.scrollableParent && props.height) {
//                 console.error(`"scrollableParent" and "height" only need one`);
//             }
//         }

//         // 加载下一个列表时重置状态
//         if (props?.length) {
//             if (loadNumRef.current !== 0) {
//                 resetStatus(target);
//             }

//             loadNumRef.current = props?.length;
//         }

//         // 更新高度
//         setPrevScrollHeight(target.scrollHeight);
//         return () => {
//             removeEvents();
//         };
//     }, [props?.length]);

//     // 加载到新数据后重置状态
//     const resetStatus = (target: any) => {
//         // 反向加载的时候需要重置滚动高度
//         if (inverse && loading && isElementAtTop(target, thresholdValue)) {
//             setScroll(target, 0, (prevScrollHeight && target.scrollHeight - prevScrollHeight) ? target.scrollHeight - prevScrollHeight : 50);
//         }
//         // 结束触发
//         finishTriggerRef.current = false;
//         // 结束loading
//         setLoading(false);
//         // 结束error状态
//         errorChange(false);
//         // 设置加载状态
//         setRefreshType(COMPONENT_TYPE.END);
//     };

//     // error状态change
//     const errorChange = (value: boolean = false) => {
//         errorRef.current = value;
//         setIsError(value);
//     };

//     // 实时监听状态isError
//     useEffect(() => {
//         errorChange(props.isError);
//     }, [props.isError]);

//     // 实时监听状态forbidTrigger
//     useEffect(() => {
//         forbidTriggerRef.current = props.forbidTrigger;
//     }, [props.forbidTrigger]);

//     // 监听滚动事件
//     const onScrollListener = (event: EventType) => {
//         if (typeof onScroll === 'function') {
//             setTimeout(() => onScroll && onScroll(event), 0);
//         }

//         if (finishTriggerRef.current || forbidTriggerRef.current || errorRef.current) return;

//         const target = scrollableRef.current;
//         const atBottom = inverse
//             ? isElementAtTop(target, thresholdValue)
//             : isElementAtBottom(target, thresholdValue);

//         // 加载数据
//         if (atBottom && hasMore) {
//             finishTriggerRef.current = true;
//             setLoading(true);
//             next && next();
//         }
//     };

//     // 初始化绑定事件(滚动节点可能是异步也可能是同步)
//     const initDom = (scrollableParent: HTMLElement) => {
//         if (forbidTriggerRef.current) return;
//         // 滚动父节点绑定事件(文档根节点不能绑定事件)
//         const el: any = [document.documentElement, document.body].includes(scrollableParent) ? (document || window) : scrollableParent;
//         eventRef.current = el;

//         if (el) {
//             const throttledOnScrollListener = throttle(onScrollListener);
//             addEvent(el, 'scroll', throttledOnScrollListener);
//         }

//         if (pullDownToRefresh && el) {
//             addEvent(document, dragEventFor.start, onStart);
//             addEvent(document, dragEventFor.move, onMove);
//             addEvent(document, dragEventFor.stop, onEnd);
//         }
//     };

//     const removeEvents = () => {
//         const el = eventRef.current;
//         if (el) {
//             const throttledOnScrollListener = throttle(onScrollListener);
//             removeEvent(el, 'scroll', throttledOnScrollListener);

//             if (pullDownToRefresh) {
//                 removeEvent(el, dragEventFor.start, onStart);
//                 removeEvent(el, dragEventFor.move, onMove);
//                 removeEvent(document, dragEventFor.stop, onEnd);
//                 // 取消raf
//                 Raf.cancelRaf(resetDrag);
//             }
//         }
//     };

//     const onStart = (evt: EventType) => {
//         const condition = inverse ? !isElementAtBottom(scrollableRef.current, thresholdValue) : !isElementAtTop(scrollableRef.current, thresholdValue);
//         if (condition) return;
//         mouseDownRef.current = true;
//         preStartYRef.current = getEventPosition(evt)?.y || 0;
//         const scrollContainerDom = scrollContainerRef.current;
//         if (scrollContainerDom) {
//             scrollContainerDom.style.willChange = 'transform';
//             scrollContainerDom.style.transition = `transform 0.2s cubic-bezier(0,0,0.31,1)`;
//         }
//     };

//     const onMove = (evt: EventType) => {
//         if (!mouseDownRef.current) return;
//         if (minPullDown > maxPullDown) {
//             console.warn(`"minPullDown" is large than "maxPullDown", please set "maxPullDown" and "maxPullDown" should large than "minPullDown"`);
//             return;
//         }

//         const minHeight = minPullDown;
//         const maxHeight = maxPullDown;

//         const startY = getEventPosition(evt)?.y || 0;
//         const deltaY = startY - preStartYRef.current;

//         if (inverse) {
//             if (deltaY < 0) {
//                 const num = Math.max(deltaY, -maxHeight);
//                 setPullDistance(num);
//                 pullDistanceRef.current = num;
//                 Raf.setRaf(() => setDrag(num));
//             }
//         } else {
//             if (deltaY > 0) {
//                 const num = Math.min(deltaY, maxHeight)
//                 setPullDistance(num);
//                 pullDistanceRef.current = num;
//                 Raf.setRaf(() => setDrag(num));
//             }
//         }

//         // 最小判断边界
//         if (Math.abs(deltaY) >= minHeight) {
//             setRefreshType(COMPONENT_TYPE.RELEASE);
//         } else {
//             setRefreshType(COMPONENT_TYPE.PULL);
//         }
//     };

//     const onEnd = (evt: EventType) => {
//         if (typeof refreshFunction !== 'function') {
//             throw new Error(`"refreshFunction" is not function or missing`);
//         }

//         mouseDownRef.current = false;
//         if (Math.abs(pullDistanceRef.current) > 0) {
//             setRefreshType(COMPONENT_TYPE.REFRESHING);
//             refreshFunction && refreshFunction();
//             Raf.setRaf(resetDrag);
//             preStartYRef.current = 0;
//             setPullDistance(0);
//             pullDistanceRef.current = 0;
//         }
//     };

//     const resetDrag = () => {
//         const childrenContainer = childrenContainerRef.current;
//         if (childrenContainer) {
//             childrenContainer.style.transform = 'none';
//             childrenContainer.style.willChange = 'none';
//         }
//     };

//     const setDrag = (move: number) => {
//         const childrenContainer = childrenContainerRef.current;
//         if (childrenContainer) {
//             childrenContainer.style.transition = `transform 0.2s cubic-bezier(0,0,0.31,1)`;
//             childrenContainer.style.transform = `translate3d(0px, ${move}px, 0px)`;
//         }
//     };

//     // 是否在顶部
//     const isElementAtTop = (target: HTMLElement, thresholdValue: number | string = 0.8) => {
//         const scrollTop = getScroll(target)?.y || 0;
//         const threshold = parseThreshold(thresholdValue);

//         if (threshold.unit === ThresholdUnits.Pixel) {
//             return (
//                 scrollTop <= threshold.value
//             );
//         }

//         return scrollTop <= 20;
//     };

//     // 是否在底部
//     const isElementAtBottom = (target: HTMLElement, thresholdValue: number | string = 0.8) => {
//         const clientHeight = getOffsetWH(target)?.height || 0;
//         const scrollTop = getScroll(target)?.y || 0;
//         const threshold = parseThreshold(thresholdValue);

//         if (threshold.unit === ThresholdUnits.Pixel) {
//             return (
//                 scrollTop + clientHeight >= target.scrollHeight - threshold.value
//             );
//         }

//         return (
//             scrollTop + clientHeight >=
//             (threshold.value / 100) * target.scrollHeight
//         );
//     };

//     const hasChildren = !!(props.children);

//     // 当设置了滚动固定高度, 下拉/上拉刷新时阻止元素溢出到外面显示
//     const outerDivStyle: CSSProperties = pullDownToRefresh && height
//         ? { overflow: 'hidden' }
//         : {};

//     // 当组件滚动的容器在外部（即设置了scrollableParent），则设置overflow: hidden, 以免组件内部出现滚动条
//     const insideStyle: CSSProperties = {
//         height: height || 'auto',
//         overflow: props.height ? 'auto' : "hidden",
//         WebkitOverflowScrolling: 'touch',
//         ...containerStyle,
//     };

//     // 加载更多相关组件
//     const loadingMoreComponent = (
//         <>
//             {(loading || (!loading && !hasChildren)) && hasMore && !isError && loadingComponent}
//             {isError && errorComponent}
//             {!hasMore && !isError && endComponent}
//         </>
//     );

//     // 下拉刷新的相关组件
//     const refreshProps: any = {
//         [COMPONENT_TYPE.PULL]: pullDownComponent,
//         [COMPONENT_TYPE.RELEASE]: releaseComponent,
//         [COMPONENT_TYPE.REFRESHING]: refreshingComponent,
//         [COMPONENT_TYPE.END]: refreshEndComponent
//     };

//     const refreshComponent =
//         pullDownToRefresh && (
//             <div
//                 style={{ display: (pullDistance || refreshType === COMPONENT_TYPE.REFRESHING) ? 'block' : 'none' }}
//             >
//                 <span>
//                     {refreshProps[refreshType]}
//                 </span>
//             </div>
//         );

//     return (
//         <div
//             style={outerDivStyle}
//             className="infinite-scroll-component__outerdiv"
//         >
//             <div
//                 className={`infinite-scroll-component ${className || ''}`}
//                 ref={scrollContainerRef}
//                 style={insideStyle}
//             >
//                 <div ref={childrenContainerRef}>
//                     {!inverse && refreshComponent}
//                     {inverse && loadingMoreComponent}
//                     {
//                         React.Children.map(props.children, (child, index) => {
//                             return React.cloneElement(React.Children.only(child), {
//                                 style: { ...child.props.style }
//                             });
//                         })
//                     }
//                     {!inverse && loadingMoreComponent}
//                     {inverse && refreshComponent}
//                 </div>
//             </div>
//         </div>
//     );
// });

// export default InfiniteScroll;