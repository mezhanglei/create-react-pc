import React, { useRef, useState } from "react";
import {
    DraggableAreaProps,
    DraggableAreaBuilder,
    TagInterface
} from "./types";
import classNames from "classnames";
import { GridItem, GridItemHandler } from "./grid-item";

// 拖拽容器
const buildDraggableArea: DraggableAreaBuilder = ({ triggerAddFunc, listenAddFunc, areaId }) => {

    // 拖拽区域
    const DraggableArea = React.forwardRef<any, DraggableAreaProps>((props, ref) => {

        const {
            className,
            style,
            placeholder,
            ...rest
        } = props;

        const [containerHeight, setContainerHeight] = useState<number>(500);
        const [layout, setLayout] = useState<TagInterface[]>([]);
        const layoutRef = useRef<TagInterface[]>([]);

        const [placeholderShow, setPlaceholderShow] = useState<Boolean>(false);
        const placeholderShowRef = useRef<boolean>(false);
        const [placeholderMoving, setPlaceholderMoving] = useState<Boolean>();
        const placeholderMovingRef = useRef<boolean>(false);

        const layoutChange = (val: TagInterface[] | undefined) => {
            layoutRef.current = val || [];
            setLayout(layoutRef.current);
        }

        const placeholderShowChange = (val: boolean) => {
            placeholderShowRef.current = val;
            setPlaceholderShow(val);
        }

        const placeholderMovingChange = (val: boolean) => {
            placeholderMovingRef.current = val;
            setPlaceholderMoving(val);
        }

        const onDragStart: GridItemHandler = (e, tag) => {

        }

        const onDrag: GridItemHandler = (e, tag) => {

        }

        const onDragEnd: GridItemHandler = (e, tag) => {

        }

        const onResizeStart: GridItemHandler = (e, tag) => {

        }

        const onResizing: GridItemHandler = (e, tag) => {

        }

        const onResizeEnd: GridItemHandler = (e, tag) => {

        }

        const getGridItem = (tag: TagInterface, index: number) => {
            return (
                <GridItem
                    {...rest}
                    onDragStart={onDragStart}
                    onDrag={onDrag}
                    onDragEnd={onDragEnd}
                    onResizeStart={onResizeStart}
                    onResizing={onResizing}
                    onResizeEnd={onResizeEnd}
                    gridX={gridX}
                    gridY={gridY}
                    gridW={gridW}
                    gridH={gridH}
                    id={index}
                >
                    {props?.children(tag, { isDragging: renderItem.isUserMove !== void 666 ? renderItem.isUserMove : false })}
                </GridItem>
            )
        }

        const renderPlaceholder = () => {
            if (!placeholderShowRef) return null;
            if (!placeholder) return null;
            return (
                <GridItem
                    {...rest}
                    onDragStart={onDragStart}
                    onDrag={onDrag}
                    onDragEnd={onDragEnd}
                    onResizeStart={onResizeStart}
                    onResizing={onResizing}
                    onResizeEnd={onResizeEnd}
                    gridX={gridX}
                    gridY={gridY}
                    gridW={gridW}
                    gridH={gridH}
                    id={index}
                >
                    <div />
                </GridItem>
            )
        }

        const cls = classNames('DraggerLayout', className);

        return (
            <div
                className={cls}
                style={{
                    ...style,
                    zIndex: 1
                }}
            >
                {layout.map((item, index) => {
                    return getGridItem(item, index)
                })}
                {renderPlaceholder()}
            </div>
        );
    });

    return DraggableArea;
}
export default buildDraggableArea