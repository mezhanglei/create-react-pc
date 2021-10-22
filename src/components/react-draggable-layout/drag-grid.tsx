import React, { useState, useEffect, useRef, useImperativeHandle } from 'react';
import GridItem from './grid-item';
import { GridItemEventHandle, DragTypes, GridItemEvent } from "./grid-item-types";
import { compactLayout, getMaxContainerHeight, layoutCheck, correctLayout, syncLayout } from './utils/dom';
import { DragGridProps, MapLayout } from './drag-grid-types';
import classNames from "classnames";
import { throttle } from '@/utils/common';

const DragGrid = React.forwardRef<{}, DragGridProps>((props, ref) => {

    const [parentDragType, setParentDragType] = useState<`${DragTypes}`>();
    const [layout, setLayout] = useState<GridItemEvent[]>([]);
    const [mapLayout, setMapLayout] = useState<MapLayout>();
    const [containerHeight, setContainerHeight] = useState<number>();

    const parentRef = useRef<any>();
    // 节流函数
    const throttleFn = useRef(throttle((fn: any, ...args: any[]) => fn(...args), 16.7)).current;

    useImperativeHandle(ref, () => ({
        getLayout
    }));

    // api
    const getLayout = () => {
        return layout;
    }

    useEffect(() => {
        recalculateLayout(props.layout, props?.cols);
    }, [props.layout, props?.cols, props?.rowHeight, props?.margin]);

    const recalculateLayout = (layout: GridItemEvent[], cols: number) => {
        const corrected = correctLayout(layout, cols);
        const { compacted, mapLayout } = compactLayout(
            corrected,
            undefined,
            undefined
        );

        setLayout(compacted);
        setMapLayout(mapLayout);
        setContainerHeight(getMaxContainerHeight(
            compacted,
            props?.rowHeight,
            props?.margin?.[1],
            containerHeight,
            false
        ));
    }

    const onDragStart: GridItemEventHandle = (layoutItem, e) => {
        setParentDragType(DragTypes.dragStart);
        setMapLayout(mapLayout && syncLayout(mapLayout, layoutItem))
        props.onDragStart && props.onDragStart(layoutItem, layout, undefined, e);
    }

    const onDrag: GridItemEventHandle = (layoutItem, e) => {
        throttleFn(() => {
            setParentDragType(DragTypes.draging);
            const newLayout = layoutCheck(
                layout,
                layoutItem,
                layoutItem?.uniqueKey + '',
                layoutItem?.uniqueKey + '' /*用户移动方块的key */
            )
            const ret = compactLayout(
                newLayout,
                layoutItem,
                mapLayout
            );
            setLayout(ret?.compacted);
            setMapLayout(ret?.mapLayout);
            setContainerHeight(getMaxContainerHeight(
                ret?.compacted,
                props?.rowHeight,
                props?.margin?.[1],
                containerHeight
            ))
            props.onDrag && props.onDrag(layoutItem, layout, ret?.compacted, e)
        });
    }

    const onDragEnd: GridItemEventHandle = (layoutItem, e) => {
        setParentDragType(DragTypes.dragEnd);

        const ret = compactLayout(
            layout,
            undefined,
            mapLayout
        );
        setLayout(ret?.compacted);
        setMapLayout(ret?.mapLayout);
        setContainerHeight(getMaxContainerHeight(
            ret?.compacted,
            props?.rowHeight,
            props?.margin?.[1],
            containerHeight
        ))
        props.onDragEnd && props.onDragEnd(layoutItem, layout, ret?.compacted, e);
    }

    const onResizeStart: GridItemEventHandle = (layoutItem, e) => {
        setParentDragType(DragTypes.resizeStart);
        const newlayout = mapLayout && syncLayout(mapLayout, layoutItem);
        setMapLayout(newlayout);
        props.onResizeStart && props.onResizeStart(layoutItem, layout, undefined, e);
    }

    const onResizing: GridItemEventHandle = (layoutItem, e) => {
        throttleFn(() => {
            setParentDragType(DragTypes.resizing);
            const newLayout = layoutCheck(
                layout,
                layoutItem,
                layoutItem.uniqueKey + '',
                layoutItem.uniqueKey + ''
            );
            const ret = compactLayout(
                newLayout,
                layoutItem,
                mapLayout
            );
            setLayout(ret?.compacted);
            setMapLayout(ret?.mapLayout);
            setContainerHeight(getMaxContainerHeight(
                ret?.compacted,
                props?.rowHeight,
                props?.margin?.[1],
                containerHeight,
                false
            ));
            props.onResizing && props.onResizing(layoutItem, layout, ret?.compacted, e);
        })
    }

    const onResizeEnd: GridItemEventHandle = (layoutItem, e) => {
        setParentDragType(DragTypes.resizeEnd);
        const ret = compactLayout(
            layout,
            undefined,
            mapLayout
        );
        setLayout(ret?.compacted);
        setMapLayout(ret?.mapLayout);
        setContainerHeight(getMaxContainerHeight(
            ret?.compacted,
            props?.rowHeight,
            props?.margin?.[1],
            containerHeight
        ));
        props.onResizeEnd && props.onResizeEnd(layoutItem, layout, ret?.compacted, e);
    }

    const getGridItem = (child: any) => {
        if (mapLayout) {
            const uniqueKey = child?.key;
            const renderItem = mapLayout?.[uniqueKey + ''];
            return (
                <GridItem
                    {...renderItem}
                    margin={props?.margin}
                    cols={props?.cols}
                    bounds={parentRef.current}
                    containerWidth={props?.width}
                    containerPadding={props?.padding ?? [0, 0]}
                    rowHeight={props?.rowHeight}
                    onDragStart={onDragStart}
                    onDrag={onDrag}
                    onDragEnd={onDragEnd}
                    uniqueKey={uniqueKey}
                    onResizeStart={onResizeStart}
                    onResizing={onResizing}
                    onResizeEnd={onResizeEnd}
                    zIndexRange={[2, 10]}
                    isMove={renderItem?.isMove ?? false}
                    parentDragType={parentDragType}
                    key={uniqueKey}
                >
                    {child}
                </GridItem>
            )
        }
    }

    const cls = classNames('DraggerLayout', props?.className);

    return (
        <div
            ref={parentRef}
            className={cls}
            style={{
                ...props?.style,
                left: 100,
                width: props?.width || parentRef.current?.style?.width,
                height: containerHeight,
                zIndex: 1
            }}
        >
            {
                React.Children.map(props?.children, (child) => {
                    if (child) {
                        return getGridItem(child);
                    }
                })
            }
        </div>
    );
});
export default DragGrid;