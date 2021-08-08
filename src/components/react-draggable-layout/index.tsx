import React, { useState, useEffect, useRef, useImperativeHandle } from 'react';
import GridItem from './grid-item';
import { GridItemEventHandle } from "./grid-item-types";
import { compactLayout, getMaxContainerHeight, layoutCheck, correctLayout, syncLayout } from './util/dom';
import { DragactProps, DragactState, DragactLayoutItem } from './dragact-type';
import classNames from "classnames";
import { DragTypes } from '../react-dragger-sort/utils/types';

export const Dragact = React.forwardRef<{}, DragactProps>((props, ref) => {

    const {
        width,
        margin,
        rowHeight,
        padding,
        col,
        style,
        className,
        children
    } = props;

    const [parentDragType, setParentDragType] = useState<`${DragTypes}`>();
    const [state, setState] = useState<DragactState>({
        containerHeight: 500,
        mapLayout: undefined,
        layout: []
    });

    const parentRef = useRef<any>();

    useImperativeHandle(ref, () => ({
        getLayout
    }));

    // api
    const getLayout = () => {
        return state.layout;
    }

    useEffect(() => {
        recalculateLayout(props.layout, col);
    }, [props.layout, col, rowHeight, margin]);

    const recalculateLayout = (layout: DragactLayoutItem[], col: number) => {
        const corrected = correctLayout(layout, col)
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
                rowHeight,
                margin[1],
                state?.containerHeight,
                false
            )
        }))
    }


    const onDragStart: GridItemEventHandle = (layoutItem) => {
        setParentDragType(DragTypes.dragStart);
        setState(state => {
            const mapLayout = state.mapLayout;
            props.onDragStart && props.onDragStart(layoutItem, state.layout);
            return {
                ...state,
                mapLayout: mapLayout && syncLayout(mapLayout, layoutItem),

            }
        })
    }
    const onDrag: GridItemEventHandle = (layoutItem) => {
        setParentDragType(DragTypes.draging);
        setState(state => {
            const newLayout = layoutCheck(
                state.layout,
                layoutItem,
                layoutItem?.UniqueKey + '',
                layoutItem?.UniqueKey + '' /*用户移动方块的key */
            )
            const { compacted, mapLayout } = compactLayout(
                newLayout,
                layoutItem,
                state.mapLayout
            );
            props.onDrag && props.onDrag(layoutItem, state.layout, compacted)
            return {
                ...state,
                layout: compacted,
                mapLayout: mapLayout,
                containerHeight: getMaxContainerHeight(
                    compacted,
                    rowHeight,
                    margin[1],
                    state.containerHeight
                )
            }
        })
    }
    const onDragEnd: GridItemEventHandle = (layoutItem) => {
        setParentDragType(DragTypes.dragEnd);
        setState(state => {
            const { compacted, mapLayout } = compactLayout(
                state.layout,
                undefined,
                state.mapLayout
            );
            props.onDragEnd && props.onDragEnd(layoutItem, state.layout, compacted);
            return {
                ...state,
                layout: compacted,
                mapLayout,
                containerHeight: getMaxContainerHeight(
                    compacted,
                    rowHeight,
                    margin[1],
                    state.containerHeight
                )
            }
        });
    }
    const onResizeStart: GridItemEventHandle = (layoutItem) => {
        setParentDragType(DragTypes.resizeStart);
        setState(state => {
            const mapLayout = state?.mapLayout;
            const newlayout = mapLayout && syncLayout(mapLayout, layoutItem);
            const layout = state?.layout;
            props.onResizeStart && props.onResizeStart(layoutItem, layout);
            return {
                ...state,
                mapLayout: newlayout
            }
        });
    }
    const onResizing: GridItemEventHandle = (layoutItem) => {
        setParentDragType(DragTypes.resizing);
        setState(state => {
            const newLayout = layoutCheck(
                state.layout,
                layoutItem,
                layoutItem.UniqueKey + '',
                layoutItem.UniqueKey + ''
            )

            const { compacted, mapLayout } = compactLayout(
                newLayout,
                layoutItem,
                state?.mapLayout
            );
            props.onResizing && props.onResizing(layoutItem, state.layout, compacted);
            return {
                ...state,
                layout: compacted,
                mapLayout: mapLayout,
                containerHeight: getMaxContainerHeight(
                    compacted,
                    rowHeight,
                    margin[1],
                    state.containerHeight,
                    false
                )
            }
        })
    }
    const onResizeEnd: GridItemEventHandle = (layoutItem) => {
        setParentDragType(DragTypes.resizeEnd);
        setState(state => {
            const { compacted, mapLayout } = compactLayout(
                state.layout,
                undefined,
                state.mapLayout
            );
            props.onDragEnd && props.onDragEnd(layoutItem, compacted);
            props.onResizeEnd && props.onResizeEnd(layoutItem, state.layout, compacted);
            return {
                ...state,
                layout: compacted,
                mapLayout: mapLayout,
                containerHeight: getMaxContainerHeight(
                    compacted,
                    rowHeight,
                    margin[1],
                    state.containerHeight
                )
            }
        })
    }


    const getGridItem = (child: any) => {
        if (state?.mapLayout) {
            const renderItem = state?.mapLayout?.[child.key + ''];
            return (
                <GridItem
                    {...renderItem}
                    margin={margin}
                    col={col}
                    bounds={parentRef.current}
                    containerWidth={width}
                    containerPadding={padding ? [padding, padding] : [0, 0]}
                    rowHeight={rowHeight}
                    onDragStart={onDragStart}
                    onDrag={onDrag}
                    onDragEnd={onDragEnd}
                    UniqueKey={child.key}
                    onResizeStart={onResizeStart}
                    onResizing={onResizing}
                    onResizeEnd={onResizeEnd}
                    zIndexRange={[2, 10]}
                    isMove={renderItem?.isMove ?? false}
                    parentDragType={parentDragType}
                    key={child.key}
                >
                    {child}
                </GridItem>
            )
        }
    }

    const cls = classNames('DraggerLayout', className);

    return (
        <div
            ref={parentRef}
            className={cls}
            style={{
                ...style,
                left: 100,
                width: width,
                height: state.containerHeight || parentRef.current?.style?.width,
                zIndex: 1
            }}
        >
            {
                React.Children.map(children, (child) => {
                    if (child) {
                        return getGridItem(child);
                    }
                })
            }
        </div>
    )
})