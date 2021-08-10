import React, { useState, useEffect, useRef, useImperativeHandle } from 'react';
import GridItem from './grid-item';
import { GridItemEventHandle, DragTypes, GridItemEvent } from "./grid-item-types";
import { compactLayout, getMaxContainerHeight, layoutCheck, correctLayout, syncLayout } from './utils/dom';
import { DragGridProps, DragGridState } from './drag-grid-types';
import classNames from "classnames";
import { throttle } from '@/utils/common';

const DragGrid = React.forwardRef<{}, DragGridProps>((props, ref) => {

    const [parentDragType, setParentDragType] = useState<`${DragTypes}`>();
    const [state, setState] = useState<DragGridState>({
        mapLayout: undefined,
        layout: []
    });

    const parentRef = useRef<any>();
    // 节流函数
    const throttleFn = useRef(throttle((fn: any, ...args: any[]) => fn(...args), 16.7)).current;

    useImperativeHandle(ref, () => ({
        getLayout
    }));

    // api
    const getLayout = () => {
        return state.layout;
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

        setState(state => ({
            ...state,
            layout: compacted,
            mapLayout: mapLayout,
            containerHeight: getMaxContainerHeight(
                compacted,
                props?.rowHeight,
                props?.margin?.[1],
                state?.containerHeight,
                false
            )
        }))
    }


    const onDragStart: GridItemEventHandle = (layoutItem, e) => {
        setParentDragType(DragTypes.dragStart);
        setState(state => {
            const mapLayout = state.mapLayout;
            props.onDragStart && props.onDragStart(layoutItem, state.layout, undefined, e);
            return {
                ...state,
                mapLayout: mapLayout && syncLayout(mapLayout, layoutItem),
            }
        })
    }
    const onDrag: GridItemEventHandle = (layoutItem, e) => {
        throttleFn(() => {
            setParentDragType(DragTypes.draging);
            setState(state => {
                const newLayout = layoutCheck(
                    state.layout,
                    layoutItem,
                    layoutItem?.uniqueKey + '',
                    layoutItem?.uniqueKey + '' /*用户移动方块的key */
                )
                const { compacted, mapLayout } = compactLayout(
                    newLayout,
                    layoutItem,
                    state.mapLayout
                );
                props.onDrag && props.onDrag(layoutItem, state.layout, compacted, e)
                return {
                    ...state,
                    layout: compacted,
                    mapLayout: mapLayout,
                    containerHeight: getMaxContainerHeight(
                        compacted,
                        props?.rowHeight,
                        props?.margin?.[1],
                        state.containerHeight
                    )
                }
            })
        });
    }
    const onDragEnd: GridItemEventHandle = (layoutItem, e) => {
        setParentDragType(DragTypes.dragEnd);
        setState(state => {
            const { compacted, mapLayout } = compactLayout(
                state.layout,
                undefined,
                state.mapLayout
            );
            props.onDragEnd && props.onDragEnd(layoutItem, state.layout, compacted, e);
            return {
                ...state,
                layout: compacted,
                mapLayout,
                containerHeight: getMaxContainerHeight(
                    compacted,
                    props?.rowHeight,
                    props?.margin?.[1],
                    state.containerHeight
                )
            }
        });
    }
    const onResizeStart: GridItemEventHandle = (layoutItem, e) => {
        setParentDragType(DragTypes.resizeStart);
        setState(state => {
            const mapLayout = state?.mapLayout;
            const newlayout = mapLayout && syncLayout(mapLayout, layoutItem);
            const layout = state?.layout;
            props.onResizeStart && props.onResizeStart(layoutItem, layout, undefined, e);
            return {
                ...state,
                mapLayout: newlayout
            }
        });
    }
    const onResizing: GridItemEventHandle = (layoutItem, e) => {
        throttleFn(() => {
            setParentDragType(DragTypes.resizing);
            setState(state => {
                const newLayout = layoutCheck(
                    state.layout,
                    layoutItem,
                    layoutItem.uniqueKey + '',
                    layoutItem.uniqueKey + ''
                )

                const { compacted, mapLayout } = compactLayout(
                    newLayout,
                    layoutItem,
                    state?.mapLayout
                );
                props.onResizing && props.onResizing(layoutItem, state.layout, compacted, e);
                return {
                    ...state,
                    layout: compacted,
                    mapLayout: mapLayout,
                    containerHeight: getMaxContainerHeight(
                        compacted,
                        props?.rowHeight,
                        props?.margin?.[1],
                        state.containerHeight,
                        false
                    )
                }
            })
        })
    }
    const onResizeEnd: GridItemEventHandle = (layoutItem, e) => {
        setParentDragType(DragTypes.resizeEnd);
        setState(state => {
            const { compacted, mapLayout } = compactLayout(
                state.layout,
                undefined,
                state.mapLayout
            );
            props.onDragEnd && props.onDragEnd(layoutItem, compacted);
            props.onResizeEnd && props.onResizeEnd(layoutItem, state.layout, compacted, e);
            return {
                ...state,
                layout: compacted,
                mapLayout: mapLayout,
                containerHeight: getMaxContainerHeight(
                    compacted,
                    props?.rowHeight,
                    props?.margin?.[1],
                    state.containerHeight
                )
            }
        })
    }


    const getGridItem = (child: any) => {
        if (state?.mapLayout) {
            const uniqueKey = child?.key;
            const renderItem = state?.mapLayout?.[uniqueKey + ''];
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
                height: state.containerHeight,
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
    )
});
export default DragGrid;