import React, { useState, useEffect, useRef, useImperativeHandle } from 'react';
import GridItem from './grid-item';
import { GridItemEventHandle, DragTypes, GridItemEvent } from "./grid-item-types";
import { compactLayout, layoutCheck, correctLayout, bottom, getLayoutItem } from './utils/dom';
import { DragGridProps } from './drag-grid-types';
import classNames from "classnames";
import { throttle } from '@/utils/common';

const DragGrid = React.forwardRef<{}, DragGridProps>((props, ref) => {

  const [layout, setLayout] = useState<GridItemEvent[]>([]);
  const [parentDragType, setParentDragType] = useState<DragTypes>();
  const [placeholder, setPlaceholder] = useState<{ GridX: number, GridY: number, w: number, h: number }>({ GridX: 0, GridY: 0, w: 0, h: 0 });

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
  }, [props.layout, props?.cols]);

  const recalculateLayout = (layout: GridItemEvent[], cols: number) => {
    const corrected = correctLayout(layout, cols);
    const compacted = compactLayout(
      corrected,
      undefined
    );

    setLayout(compacted);
  }

  const onDragStart: GridItemEventHandle = (layoutItem, e) => {
    setParentDragType(DragTypes.dragStart);
    setPlaceholder({
      GridX: layoutItem?.GridX,
      GridY: layoutItem?.GridY,
      w: layoutItem?.w,
      h: layoutItem?.h
    });
    props.onDragStart && props.onDragStart(layoutItem, layout, undefined, e);
  }

  const onDrag: GridItemEventHandle = (layoutItem, e) => {
    throttleFn(() => {
      setParentDragType(DragTypes.draging);
      const newLayout = layoutCheck(
        layout,
        layoutItem
      )
      const compacted = compactLayout(
        newLayout,
        layoutItem
      );
      setLayout(compacted);
      setPlaceholder((data) => ({
        ...data,
        GridX: layoutItem?.GridX,
        GridY: layoutItem?.GridY
      }));
      props.onDrag && props.onDrag(layoutItem, layout, compacted, e)
    });
  }

  const onDragEnd: GridItemEventHandle = (layoutItem, e) => {
    setParentDragType(DragTypes.dragEnd);

    const compacted = compactLayout(
      layout,
      undefined
    );
    setLayout(compacted);
    props.onDragEnd && props.onDragEnd(layoutItem, layout, compacted, e);
  }

  const onResizeStart: GridItemEventHandle = (layoutItem, e) => {
    setParentDragType(DragTypes.resizeStart);
    setPlaceholder({
      GridX: layoutItem?.GridX,
      GridY: layoutItem?.GridY,
      w: layoutItem?.w,
      h: layoutItem?.h
    });
    props.onResizeStart && props.onResizeStart(layoutItem, layout, undefined, e);
  }

  const onResizing: GridItemEventHandle = (layoutItem, e) => {
    throttleFn(() => {
      setParentDragType(DragTypes.resizing);
      const newLayout = layoutCheck(
        layout,
        layoutItem
      );
      const compacted = compactLayout(
        newLayout,
        layoutItem
      );
      setLayout(compacted);
      setPlaceholder((data) => ({ ...data, w: layoutItem?.w, h: layoutItem?.h }));
      props.onResizing && props.onResizing(layoutItem, layout, compacted, e);
    })
  }

  const onResizeEnd: GridItemEventHandle = (layoutItem, e) => {
    setParentDragType(DragTypes.resizeEnd);
    const compacted = compactLayout(
      layout,
      undefined
    );
    setLayout(compacted);
    props.onResizeEnd && props.onResizeEnd(layoutItem, layout, compacted, e);
  }

  const getGridItem = (child: any) => {
    if (layout?.length) {
      const uniqueKey = child?.key;
      const renderItem = getLayoutItem(layout, uniqueKey);
      if (!renderItem) return;
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
        >
          {child}
        </GridItem>
      )
    }
  }

  const renderPlaceholder = () => {
    if (parentDragType && [DragTypes.dragEnd, DragTypes.resizeEnd].includes(parentDragType)) return;
    return (
      <GridItem
        margin={props?.margin}
        cols={props?.cols}
        bounds={parentRef.current}
        containerWidth={props?.width}
        containerPadding={props?.padding ?? [0, 0]}
        rowHeight={props?.rowHeight}
        zIndexRange={[1, 9]}
        style={{
          background: 'rgba(15,15,15,0.3)',
          transition: ' all .15s ease-out'
        }}
        GridX={placeholder.GridX}
        GridY={placeholder.GridY}
        w={placeholder.w}
        h={placeholder.h}
        dragAxis={[]}
        resizeAxis={[]}
      >
        <div />
      </GridItem>
    );
  }

  const containerHeight = () => {
    const nbRow = bottom(layout);
    const containerPaddingY = props.padding
      ? props.padding[1]
      : props.margin[1];
    return (
      nbRow * props.rowHeight +
      (nbRow - 1) * props.margin[1] +
      containerPaddingY * 2 +
      "px"
    );
  }

  const cls = classNames('DraggerLayout', props?.className);

  return (
    <div
      ref={parentRef}
      className={cls}
      style={{
        ...props?.style,
        width: props?.width || parentRef.current?.style?.width,
        height: containerHeight()
      }}
    >
      {
        React.Children.map(props?.children, (child) => {
          if (child) {
            return getGridItem(child);
          }
        })
      }
      {renderPlaceholder()}
    </div>
  );
});
export default DragGrid;
