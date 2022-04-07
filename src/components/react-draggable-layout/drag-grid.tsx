import React, { useState, useEffect, useRef, useImperativeHandle } from 'react';
import GridItem from './grid-item';
import { GridItemEventHandle, DragTypes, GridItemEvent } from "./grid-item-types";
import { compactLayout, layoutCheck, correctLayout, bottom, getLayoutItem } from './utils/dom';
import { DragGridProps } from './drag-grid-types';
import classNames from "classnames";

const DragGrid = React.forwardRef<{}, DragGridProps>((props, ref) => {

  const [layout, setLayout] = useState<GridItemEvent[]>([]);
  const [parentDragType, setParentDragType] = useState<DragTypes>();
  const [placeholder, setPlaceholder] = useState<{ GridX?: number, GridY?: number, w?: number, h?: number }>({});

  const parentRef = useRef<any>();

  useImperativeHandle(ref, () => ({
    getLayout
  }));

  // api
  const getLayout = () => {
    return layout;
  };

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
  };

  const onStart: GridItemEventHandle = (layoutItem, e) => {
    setParentDragType(DragTypes.Start);
    setPlaceholder({
      GridX: layoutItem?.GridX,
      GridY: layoutItem?.GridY,
      w: layoutItem?.w,
      h: layoutItem?.h
    });
    props.onStart && props.onStart(layoutItem, layout, undefined, e);
  };

  const onMove: GridItemEventHandle = (layoutItem, e) => {
    setParentDragType(DragTypes.Move);
    const newLayout = layoutCheck(
      layout,
      layoutItem
    );
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
    props.onMove && props.onMove(layoutItem, layout, compacted, e)
  };

  const onEnd: GridItemEventHandle = (layoutItem, e) => {
    setParentDragType(DragTypes.End);
    const compacted = compactLayout(
      layout,
      undefined
    );
    setLayout(compacted);
    props.onEnd && props.onEnd(layoutItem, layout, compacted, e);
  };

  const onResizeStart: GridItemEventHandle = (layoutItem, e) => {
    setParentDragType(DragTypes.ResizeStart);
    setPlaceholder({
      GridX: layoutItem?.GridX,
      GridY: layoutItem?.GridY,
      w: layoutItem?.w,
      h: layoutItem?.h
    });
    props.onResizeStart && props.onResizeStart(layoutItem, layout, undefined, e);
  };

  const onResizing: GridItemEventHandle = (layoutItem, e) => {
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
  };

  const onResizeEnd: GridItemEventHandle = (layoutItem, e) => {
    setParentDragType(DragTypes.ResizeEnd);
    const compacted = compactLayout(
      layout,
      undefined
    );
    setLayout(compacted);
    props.onResizeEnd && props.onResizeEnd(layoutItem, layout, compacted, e);
  };

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
          onStart={onStart}
          onMove={onMove}
          onEnd={onEnd}
          uniqueKey={uniqueKey}
          onResizeStart={onResizeStart}
          onResizing={onResizing}
          onResizeEnd={onResizeEnd}
        >
          {child}
        </GridItem>
      );
    }
  };

  const renderPlaceholder = () => {
    if (!parentDragType || [DragTypes.End, DragTypes.ResizeEnd].includes(parentDragType)) return;
    return (
      <GridItem
        margin={props?.margin}
        cols={props?.cols}
        bounds={parentRef.current}
        containerWidth={props?.width}
        containerPadding={props?.padding ?? [0, 0]}
        rowHeight={props?.rowHeight}
        style={{
          background: 'rgba(15,15,15,0.3)',
          transition: ' all .15s ease-out'
        }}
        GridX={placeholder.GridX}
        GridY={placeholder.GridY}
        w={placeholder.w}
        h={placeholder.h}
        direction={[]}
      >
        <div />
      </GridItem>
    );
  };

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
  };

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
