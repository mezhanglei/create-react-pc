import React, { useRef, useState } from "react";
import {
    DraggableAreaProps,
    DraggableAreaBuilder,
    TagInterface
} from "./types";
import classNames from "classnames";
import GridItem from "./grid-item";

// 拖拽容器
const buildDraggableArea: DraggableAreaBuilder = ({ triggerAddFunc, listenAddFunc, areaId }) => {

    // 拖拽区域
    const DraggableArea = React.forwardRef<any, DraggableAreaProps>((props, ref) => {

        const {
            className,
            style,
            width
        } = props;

        const [containerHeight, setContainerHeight] = useState<number>(500);
        const [layout, setLayout] = useState<TagInterface[]>([]);
        const layoutRef = useRef<TagInterface[]>([]);

        const getGridItem = (tag: TagInterface, index: number) => {
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

        const cls = classNames('DraggerLayout', className);

        return (
            <div
                className={cls}
                style={{
                    ...style,
                    left: 100,
                    width: width,
                    height: containerHeight,
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