import React, { useEffect, useState,useImperativeHandle } from 'react'
import GridItem, { GridItemEvent } from './gridItem'
import { compactLayout } from './util/compact'
import { getMaxContainerHeight } from './util/sort'
import { layoutCheck } from './util/collison'
import { correctLayout } from './util/correction'
import { stringJoin } from './utils'
import { layoutItemForkey, syncLayout } from './util/initiate'
import { DragactProps, DragactState, DragactLayoutItem, mapLayout } from './dragact-type';
import { EventType, GridItemHandler } from "./gridItem";

import './style.css';
import classNames from "classnames";

import { EventType as ResizeEventType, EventHandler as ResizeEventHandler } from "@/components/react-resize-zoom/type";
import Draggable, { EventType as DragEventType, DragHandler as DragEventHandler, BoundsInterface } from "@/components/react-free-draggable";

export class Dragact extends React.Component<DragactProps, DragactState> {
    constructor(props: DragactProps) {
        super(props)
        this.onDrag = this.onDrag.bind(this)
        this.onDragStart = this.onDragStart.bind(this)
        this.onDragEnd = this.onDragEnd.bind(this)

        const layout = props.layout

        this.state = {
            GridXMoving: 0,
            GridYMoving: 0,
            wMoving: 0,
            hMoving: 0,
            placeholderShow: false,
            placeholderMoving: false,
            layout: layout,
            containerHeight: 500,
            dragType: 'drag',
            mapLayout: undefined
        }
    }

    onResizeStart = (e, layoutItem: GridItemEvent) => {
        const { GridX, GridY, w, h } = layoutItem
        console.log(GridX, GridY)
        if (this.state.mapLayout) {
            const newlayout = syncLayout(this.state.mapLayout, layoutItem)
            this.setState({
                GridXMoving: GridX,
                GridYMoving: GridY,
                wMoving: w,
                hMoving: h,
                placeholderShow: true,
                placeholderMoving: true,
                mapLayout: newlayout,
                dragType: 'resize'
            })
        }
        this.props.onDragStart &&
            this.props.onDragStart(layoutItem, this.state.layout)
    }

    onResizing = (e, layoutItem: GridItemEvent) => {
        const newLayout = layoutCheck(
            this.state.layout,
            layoutItem,
            layoutItem.UniqueKey + '',
            layoutItem.UniqueKey + '',
            0
        )

        const { compacted, mapLayout } = compactLayout(
            newLayout,
            layoutItem,
            this.state.mapLayout
        )

        this.setState({
            layout: compacted,
            wMoving: layoutItem.w,
            hMoving: layoutItem.h,
            mapLayout: mapLayout,
            containerHeight: getMaxContainerHeight(
                compacted,
                this.props.rowHeight,
                this.props.margin[1],
                this.state.containerHeight,
                false
            )
        })
    }

    onResizeEnd = (e, layoutItem: GridItemEvent) => {
        const { compacted, mapLayout } = compactLayout(
            this.state.layout,
            undefined,
            this.state.mapLayout
        )
        this.setState({
            placeholderShow: false,
            layout: compacted,
            mapLayout: mapLayout,
            containerHeight: getMaxContainerHeight(
                compacted,
                this.props.rowHeight,
                this.props.margin[1],
                this.state.containerHeight
            )
        })
        this.props.onDragEnd && this.props.onDragEnd(layoutItem, compacted)
    }

    onDragStart(e, bundles: GridItemEvent) {
        const { GridX, GridY, w, h } = bundles
        if (this.state.mapLayout) {
            this.setState({
                GridXMoving: GridX,
                GridYMoving: GridY,
                wMoving: w,
                hMoving: h,
                placeholderShow: true,
                placeholderMoving: true,
                mapLayout: syncLayout(this.state.mapLayout, bundles),
                dragType: 'drag'
            })
        }
        this.props.onDragStart &&
            this.props.onDragStart(bundles, this.state.layout)
    }

    onDrag(e, layoutItem: GridItemEvent) {
        const { GridY, UniqueKey } = layoutItem
        const moving = GridY - this.state.GridYMoving

        const newLayout = layoutCheck(
            this.state.layout,
            layoutItem,
            UniqueKey + '',
            UniqueKey + '' /*用户移动方块的key */,
            moving
        )
        const { compacted, mapLayout } = compactLayout(
            newLayout,
            layoutItem,
            this.state.mapLayout
        )
        this.setState({
            GridXMoving: layoutItem.GridX,
            GridYMoving: layoutItem.GridY,
            layout: compacted,
            mapLayout: mapLayout,
            containerHeight: getMaxContainerHeight(
                compacted,
                this.props.rowHeight,
                this.props.margin[1],
                this.state.containerHeight
            )
        })
        this.props.onDrag && this.props.onDrag(layoutItem, compacted)
    }

    onDragEnd(e, layoutItem: GridItemEvent) {
        const { compacted, mapLayout } = compactLayout(
            this.state.layout,
            undefined,
            this.state.mapLayout
        )

        this.setState({
            placeholderShow: false,
            layout: compacted,
            mapLayout: mapLayout,
            containerHeight: getMaxContainerHeight(
                compacted,
                this.props.rowHeight,
                this.props.margin[1],
                this.state.containerHeight
            )
        })
        this.props.onDragEnd && this.props.onDragEnd(layoutItem, compacted)
    }

    renderPlaceholder() {
        if (!this.state.placeholderShow) return null
        var { col, padding, rowHeight, margin, placeholder, width } = this.props
        const {
            GridXMoving,
            GridYMoving,
            wMoving,
            hMoving,
            placeholderMoving,
            dragType
        } = this.state

        if (!placeholder) return null
        if (!padding) padding = 0
        return (
            <GridItem
                margin={margin}
                col={col}
                containerWidth={width}
                containerPadding={[padding, padding]}
                rowHeight={rowHeight}
                GridX={GridXMoving}
                GridY={GridYMoving}
                w={wMoving}
                h={hMoving}
                style={{
                    background: 'rgba(15,15,15,0.3)',
                    zIndex: dragType === 'drag' ? 1 : 10,
                    transition: ' all .15s ease-out'
                }}
                isUserMove={!placeholderMoving}
                dragType={dragType}
            >
                {/* {(p: any, resizerProps: any) => <div {...p} />} */}
                <div />
            </GridItem>
        )
    }

    componentWillReceiveProps(nextProps: any) {
        if (this.props.layout.length > nextProps.layout.length) {
            //remove
            const mapLayoutCopy = { ...this.state.mapLayout }
            nextProps.layout.forEach((child: any) => {
                if ((mapLayoutCopy as any)[child.key + ''] !== void 666)
                    delete (mapLayoutCopy as any)[child.key + '']
            })

            const copyed: any = { ...this.state.mapLayout }
            const newLayout = nextProps.layout.map((item: any) => {
                const { w, h, GridX, GridY, key, ...others } = item

                return {
                    ...copyed[item.key],
                    others
                }
            })
            const { compacted, mapLayout } = compactLayout(
                newLayout,
                undefined,
                this.state.mapLayout
            )
            this.setState({
                containerHeight: getMaxContainerHeight(
                    compacted,
                    this.props.rowHeight,
                    this.props.margin[1],
                    this.state.containerHeight
                ),
                layout: compacted,
                mapLayout
            })
        } else if (this.props.layout.length < nextProps.layout.length) {
            //add
            const copyed: any = { ...this.state.mapLayout }
            var newLayout = nextProps.layout.map((v: any) => {
                if (copyed[v.key]) {
                    return {
                        ...v,
                        GridX: copyed[v.key].GridX,
                        GridY: copyed[v.key].GridY,
                        w: copyed[v.key].w,
                        h: copyed[v.key].h,
                        key: copyed[v.key].key
                    }
                }

                return {
                    ...v,
                    isUserMove: false,
                    key: v.key + ''
                }
            })
            const { compacted, mapLayout } = compactLayout(
                newLayout,
                undefined,
                this.state.mapLayout
            )
            this.setState({
                containerHeight: getMaxContainerHeight(
                    compacted,
                    this.props.rowHeight,
                    this.props.margin[1],
                    this.state.containerHeight,
                    false
                ),
                layout: compacted,
                mapLayout
            })
        } else {
            this.recalculateLayout(nextProps.layout, nextProps.col)
        }
    }

    recalculateLayout = (layout: DragactLayoutItem[], col: number) => {
        const corrected = correctLayout(layout, col)
        const { compacted, mapLayout } = compactLayout(
            corrected,
            undefined,
            undefined
        )
        this.setState({
            layout: compacted,
            mapLayout: mapLayout,
            containerHeight: getMaxContainerHeight(
                compacted,
                this.props.rowHeight,
                this.props.margin[1],
                this.state.containerHeight,
                false
            )
        })
    }

    componentDidMount() {
        setTimeout(() => {
            this.recalculateLayout(this.state.layout, this.props.col)
        }, 1)
    }

    getGridItem(item: any, index: number) {
        const { dragType, mapLayout } = this.state
        var { col, padding, rowHeight, margin, width } = this.props
        if (mapLayout) {
            const renderItem = layoutItemForkey(mapLayout, item.key + '')
            if (!padding) padding = 0
            return (
                <GridItem
                    {...renderItem}
                    margin={margin}
                    col={col}
                    containerWidth={width}
                    containerPadding={[padding, padding]}
                    rowHeight={rowHeight}
                    onDrag={this.onDrag}
                    onDragStart={this.onDragStart}
                    onDragEnd={this.onDragEnd}
                    isUserMove={
                        renderItem.isUserMove !== void 666
                            ? renderItem.isUserMove
                            : false
                    }
                    UniqueKey={item.key}
                    onResizing={this.onResizing}
                    onResizeStart={this.onResizeStart}
                    onResizeEnd={this.onResizeEnd}
                    dragType={dragType}
                    key={item.key}
                >
                    {this.props.children(item, { isDragging: renderItem.isUserMove !== void 666 ? renderItem.isUserMove : false })}
                </GridItem>
            )
        }
    }

    render() {
        const { className, layout, style, width } = this.props
        const { containerHeight } = this.state

        return (
            <div
                className={stringJoin('DraggerLayout', className + '')}
                style={{
                    ...style,
                    left: 100,
                    width: width,
                    height: containerHeight,
                    zIndex: 1
                }}
            >
                {layout.map((item, index) => {
                    return this.getGridItem(item, index)
                })}
                {this.renderPlaceholder()}
            </div>
        )
    }

    //api
    getLayout() {
        return this.state.layout
    }
}

// export const Dragact = React.forwardRef<any, DragactProps>((props, ref) => {

//     const {
//         className,
//         style,
//         width,
//         col,
//         padding = 0,
//         rowHeight,
//         margin,
//         placeholder
//     } = props;

//     const [containerHeight, setContainerHeight] = useState<number>(500);
//     const [dragType, setDragType] = useState<'drag' | 'resize'>();
//     const [mapLayout, setMapLayout] = useState<mapLayout | undefined>();
//     const [layout, setLayout] = useState<DragactLayoutItem[]>([])
//     const [GridXMoving, setGridXMoving] = useState<number>(0);
//     const [GridYMoving, setGridYMoving] = useState<number>(0);
//     const [wMoving, setWMoving] = useState<number>(0);
//     const [hMoving, setHMoving] = useState<number>(0);
//     const [placeholderShow, setPlaceholderShow] = useState<Boolean>();
//     const [placeholderMoving, setPlaceholderMoving] = useState<Boolean>();

//     useEffect(() => {
//         setLayout(props?.layout);
//     }, [props?.layout])

//     useImperativeHandle(ref, () => {
//         getLayout
//     });

//     // api
//     const getLayout = () => {
//         return layout
//     }

//     useEffect(() => {
//         if (layout.length > props.layout.length) {
//             //remove
//             const mapLayoutCopy = { ...mapLayout }
//             props.layout.forEach((child: any) => {
//                 if ((mapLayoutCopy as any)[child.key + ''] !== void 666)
//                     delete (mapLayoutCopy as any)[child.key + '']
//             })

//             const copyed: any = { ...mapLayout }
//             const newLayout = props.layout.map((item: any) => {
//                 const { w, h, GridX, GridY, key, ...others } = item

//                 return {
//                     ...copyed[item.key],
//                     others
//                 }
//             })
//             const res = compactLayout(
//                 newLayout,
//                 undefined,
//                 mapLayout
//             )

//             setContainerHeight(getMaxContainerHeight(
//                 res?.compacted,
//                 rowHeight,
//                 margin[1],
//                 containerHeight
//             ));

//             setLayout(res?.compacted)
//             setMapLayout(res?.mapLayout);
//         } else if (layout.length < props.layout.length) {
//             //add
//             const copyed: any = { ...mapLayout }
//             var newLayout = props.layout.map((v: any) => {
//                 if (copyed[v.key]) {
//                     return {
//                         ...v,
//                         GridX: copyed[v.key].GridX,
//                         GridY: copyed[v.key].GridY,
//                         w: copyed[v.key].w,
//                         h: copyed[v.key].h,
//                         key: copyed[v.key].key
//                     }
//                 }

//                 return {
//                     ...v,
//                     isUserMove: false,
//                     key: v.key + ''
//                 }
//             })
//             const res = compactLayout(
//                 newLayout,
//                 undefined,
//                mapLayout
//             );
//             setContainerHeight(getMaxContainerHeight(
//                 res?.compacted,
//                 rowHeight,
//                 margin[1],
//                 containerHeight,
//                 false
//             ));
//             setLayout(res?.compacted);
//             setMapLayout(res?.mapLayout);
//         } else {
//             recalculateLayout(props.layout, props?.col)
//         }
//     }, [props?.layout, props?.col])

//     const recalculateLayout = (layout: DragactLayoutItem[], col: number) => {
//         const corrected = correctLayout(layout, col)
//         const res = compactLayout(
//             corrected,
//             undefined,
//             undefined
//         )

//         setLayout(res?.compacted);
//         setMapLayout(res?.mapLayout);
//         setContainerHeight(getMaxContainerHeight(
//             res?.compacted,
//             rowHeight,
//             margin[1],
//             containerHeight,
//             false
//         ));
//     }

//     const onDragStart: GridItemHandler = (e, layoutItem) => {
//         const { GridX, GridY, w, h } = layoutItem;
//         if (mapLayout) {
//             setGridXMoving(GridX);
//             setGridYMoving(GridY);
//             setWMoving(w);
//             setHMoving(h);
//             setPlaceholderShow(true);
//             setPlaceholderMoving(true);
//             setMapLayout(syncLayout(mapLayout, layoutItem));
//             setDragType('drag');
//         }

//         props.onDragStart && props.onDragStart(layoutItem, layout)
//     }

//     const onDrag: GridItemHandler = (e, layoutItem) => {
//         const { GridY, UniqueKey } = layoutItem
//         const moving = GridY - GridYMoving

//         const newLayout = layoutCheck(
//             layout,
//             layoutItem,
//             UniqueKey + '',
//             UniqueKey + '' /*用户移动方块的key */,
//             moving
//         )
//         const res = compactLayout(
//             newLayout,
//             layoutItem,
//             mapLayout
//         );

//         setGridXMoving(layoutItem.GridX);
//         setGridYMoving(layoutItem.GridY);
//         setLayout(res?.compacted);
//         setMapLayout(res?.mapLayout);
//         setContainerHeight(getMaxContainerHeight(
//             res?.compacted,
//             rowHeight,
//             margin[1],
//             containerHeight
//         ));
//         props.onDrag && props.onDrag(layoutItem, res?.compacted)
//     }

//     const onDragEnd: GridItemHandler = (e, layoutItem) => {
//         const res = compactLayout(
//             layout,
//             undefined,
//             mapLayout
//         );


//         setPlaceholderShow(false);
//         setLayout(res?.compacted);
//         setMapLayout(res?.mapLayout);
//         setContainerHeight(getMaxContainerHeight(
//             res?.compacted,
//             rowHeight,
//             margin[1],
//             containerHeight
//         ));

//         props.onDragEnd && props.onDragEnd(layoutItem, res?.compacted)
//     }

//     const onResizing: GridItemHandler = (e, layoutItem) => {
//         const newLayout = layoutCheck(
//             layout,
//             layoutItem,
//             layoutItem.UniqueKey + '',
//             layoutItem.UniqueKey + '',
//             0
//         )

//         const res = compactLayout(
//             newLayout,
//             layoutItem,
//             mapLayout
//         );

//         setLayout(res?.compacted);
//         setWMoving(layoutItem?.w);
//         setHMoving(layoutItem?.h);
//         setMapLayout(res?.mapLayout);
//         setContainerHeight(getMaxContainerHeight(
//             res?.compacted,
//             rowHeight,
//             margin[1],
//             containerHeight,
//             false
//         ));
//     }

//     const onResizeStart: GridItemHandler = (e, layoutItem) => {
//         const { GridX, GridY, w, h } = layoutItem
//         if (mapLayout) {
//             const newlayout = syncLayout(mapLayout, layoutItem);
//             setGridXMoving(GridX);
//             setGridYMoving(GridY);
//             setWMoving(w);
//             setHMoving(h);
//             setPlaceholderShow(true);
//             setPlaceholderMoving(true);
//             setMapLayout(newlayout);
//             setDragType('resize');
//         }
//         props.onDragStart && props.onDragStart(layoutItem, layout)
//     }

//     const onResizeEnd: GridItemHandler = (e, layoutItem) => {
//         const res = compactLayout(
//             layout,
//             undefined,
//             mapLayout
//         );

//         setPlaceholderShow(false);
//         setLayout(res?.compacted);
//         setMapLayout(res?.mapLayout);
//         setContainerHeight(getMaxContainerHeight(
//             res?.compacted,
//             rowHeight,
//             margin[1],
//             containerHeight
//         ));
//         props.onDragEnd && props.onDragEnd(layoutItem, res?.compacted)
//     }

//     const getGridItem = (item: any, index: number) => {
//         if (mapLayout) {
//             const renderItem = layoutItemForkey(mapLayout, item.key + '')
//             return (
//                 <GridItem
//                     {...renderItem}
//                     margin={margin}
//                     col={col}
//                     containerWidth={width}
//                     containerPadding={[padding || 0, padding || 0]}
//                     rowHeight={rowHeight}
//                     onDrag={onDrag}
//                     onDragStart={onDragStart}
//                     onDragEnd={onDragEnd}
//                     isUserMove={
//                         renderItem.isUserMove !== void 666
//                             ? renderItem.isUserMove
//                             : false
//                     }
//                     UniqueKey={item.key}
//                     onResizing={onResizing}
//                     onResizeStart={onResizeStart}
//                     onResizeEnd={onResizeEnd}
//                     dragType={dragType}
//                     key={item.key}
//                 >
//                     {props.children(item, { isDragging: renderItem.isUserMove !== void 666 ? renderItem.isUserMove : false })}
//                 </GridItem>
//             )
//         }
//     }

//     const renderPlaceholder = () => {
//         if (!placeholderShow) return null

//         if (!placeholder) return null

//         return (
//             <GridItem
//                 margin={margin}
//                 col={col}
//                 containerWidth={width}
//                 containerPadding={[padding, padding]}
//                 rowHeight={rowHeight}
//                 GridX={GridXMoving}
//                 GridY={GridYMoving}
//                 w={wMoving}
//                 h={hMoving}
//                 style={{
//                     background: 'rgba(15,15,15,0.3)',
//                     zIndex: dragType === 'drag' ? 1 : 10,
//                     transition: ' all .15s ease-out'
//                 }}
//                 isUserMove={!placeholderMoving}
//                 dragType={dragType}
//             >
//                 <div />
//             </GridItem>
//         )
//     }

//     const cls = classNames('DraggerLayout', className)

//     return (
//         <div
//             className={cls}
//             style={{
//                 ...style,
//                 left: 100,
//                 width: width,
//                 height: containerHeight,
//                 zIndex: 1
//             }}
//         >
//             {props?.layout.map((item, index) => {
//                 return getGridItem(item, index)
//             })}
//             {renderPlaceholder()}
//         </div>
//     )
// });