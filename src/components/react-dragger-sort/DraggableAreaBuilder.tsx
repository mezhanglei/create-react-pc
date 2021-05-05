import React, { useRef, useState } from "react";
import {
    DraggableAreaProps,
    DraggableAreaBuilder,
    PlaceholderProps,
    TagInterface
} from "./types";
import classNames from "classnames";
import DraggerItem, { DraggerItemHandler } from "./dragger-item";

// 拖拽容器
const buildDraggableArea: DraggableAreaBuilder = (props) => {

    // 拖拽区域
    const DraggableArea = React.forwardRef<any, DraggableAreaProps>((props, ref) => {

        const {
            className,
            style,
            placeholder = true,
            children,
            ...rest
        } = props;

        const [dragType, setDragType] = useState<'drag' | 'resize' | 'none'>();

        const [placeholderData, setPlaceholderData] = useState<PlaceholderProps>();
        const placeholderDataRef = useRef<PlaceholderProps>()

        const [placeholderShow, setPlaceholderShow] = useState<Boolean>(false);
        const placeholderShowRef = useRef<boolean>(false);
        const [placeholderMoving, setPlaceholderMoving] = useState<Boolean>();
        const placeholderMovingRef = useRef<boolean>(false);

        const placeholderDataChange = (val: PlaceholderProps) => {
            setPlaceholderData(val);
            placeholderDataRef.current = val;
        }

        const placeholderShowChange = (val: boolean) => {
            placeholderShowRef.current = val;
            setPlaceholderShow(val);
        }

        const placeholderMovingChange = (val: boolean) => {
            placeholderMovingRef.current = val;
            setPlaceholderMoving(val);
        }

        const onDragStart: DraggerItemHandler = (e, tag) => {
            if (!tag) return false;
            setDragType('drag');
            placeholderShowChange(true);
            placeholderDataChange({
                x: tag?.x,
                y: tag?.y,
                width: tag?.width,
                height: tag?.height
            })
        }

        const onDrag: DraggerItemHandler = (e, tag) => {
            if (!tag) return false;
            placeholderMovingChange(true);
        }

        const onDragEnd: DraggerItemHandler = (e, tag) => {
            if (!tag) return false;
            setDragType('none');
            placeholderShowChange(false);
            placeholderMovingChange(false);
        }

        const onResizeStart: DraggerItemHandler = (e, tag) => {
            if (!tag) return false;
            setDragType('resize');
        }

        const onResizing: DraggerItemHandler = (e, tag) => {
            if (!tag) return false;
        }

        const onResizeEnd: DraggerItemHandler = (e, tag) => {
            setDragType('none');
        }

        const renderPlaceholder = () => {
            return (
                <DraggerItem
                    onDragStart={onDragStart}
                    onDrag={onDrag}
                    onDragEnd={onDragEnd}
                    onResizeStart={onResizeStart}
                    onResizing={onResizing}
                    onResizeEnd={onResizeEnd}
                    x={placeholderData?.x}
                    y={placeholderData?.y}
                    width={placeholderData?.width}
                    height={placeholderData?.height}
                    id={-1}
                    zIndexRange={[1, 9]}
                    style={{
                        position: 'absolute',
                        background: 'rgba(15,15,15,0.3)',
                        transition: ' all .15s ease-out'
                    }}
                >
                    <div />
                </DraggerItem>
            )
        }

        const cls = classNames('DraggerLayout', className);

        return (
            <div
                className={cls}
                style={{
                    ...style,
                    position: 'relative',
                    zIndex: 1
                }}
            >
                {
                    React.Children.map(children, (child, index) => {
                        console.log(child)
                        return React.cloneElement(child, {
                            onDragStart: onDragStart,
                            onDrag: onDrag,
                            onDragEnd: onDragEnd,
                            onResizeStart: onResizeStart,
                            onResizing: onResizing,
                            onResizeEnd: onResizeEnd,
                            // bounds: '.DraggerLayout',
                            zIndexRange: [2, 10]
                        })
                    })
                }
                {renderPlaceholder()}
            </div>
        );
    });

    return DraggableArea;
}
export default buildDraggableArea