import React, { useEffect, useRef, useState, CSSProperties, useImperativeHandle } from 'react';
import { DragHandler as DragEventHandler, DragDirectionCode, DraggableEvent, EventHandler } from "@/components/react-free-draggable";
import { TargetParams, DragTypes, SourceParams, DndCallBackProps, DndParams, DndProps } from "./utils/types";
import classNames from "classnames";
import { getClientXY, getOffsetWH, css, addEvent, getChildrenIndex, insertAfter, insertBefore, removeEvent, isContains } from "@/utils/dom";
import { DndManager } from './dnd-manager';
import { _animate } from './utils/dom';


const OverClass = {
  pre: 'over-pre',
  next: 'over-next'
}
export default function BuildDndSortable() {

  const dndManager = new DndManager();

  // // 提供拖拽和放置的组件
  // const DndCore = React.forwardRef<any, DndProps>((props, ref) => {

  //   const {
  //     children,
  //     className,
  //     style,
  //     direction = DragDirectionCode,
  //     path,
  //     ...rest
  //   } = props;

  //   const [dragType, setDragType] = useState<DragTypes>();
  //   const nodeRef = useRef<any>();
  //   const lastZIndexRef = useRef<string>('');
  //   const currentPath = path;

  //   useImperativeHandle(ref, () => ({
  //     node: nodeRef?.current
  //   }));

  //   // 监听碰撞事件
  //   useEffect(() => {
  //     const currentNode = nodeRef.current;
  //     if (currentNode !== null && typeof currentPath == 'string' && currentPath) {
  //       const data = {
  //         node: currentNode,
  //         path: currentPath,
  //         ...rest
  //       }
  //       dndManager.subscribe(data);
  //       dndManager.setDndItemsMap(data);
  //     }
  //     return () => {
  //       dndManager.unsubscribe(currentNode)
  //     }
  //   }, [currentPath]);

  //   // 可以拖拽
  //   const canDrag = () => {
  //     return DragDirectionCode?.some((dir) => direction?.includes(dir)) && currentPath !== undefined;
  //   };

  //   // 当前元素的拖拽事件
  //   const onStartHandle: DragEventHandler = (e, data) => {
  //     const node = data?.node;
  //     const offsetWH = getOffsetWH(node);
  //     const clientXY = getClientXY(node)
  //     if (!data || !offsetWH || !clientXY || !currentPath) return false;
  //     setDragType(DragTypes.dragStart);
  //     lastZIndexRef.current = data?.node?.style?.zIndex;
  //     const params = {
  //       node: node,
  //       dragType: DragTypes.dragStart,
  //       path: currentPath,
  //       x: data?.x as number,
  //       y: data?.y as number,
  //       width: offsetWH?.width,
  //       height: offsetWH?.height
  //     }
  //     rest.onStart && rest.onStart({ e, source: params })
  //   };

  //   // 当前元素的拖拽事件
  //   const onMoveHandle: DragEventHandler = (e, data) => {
  //     const node = data?.node;
  //     const offsetWH = getOffsetWH(node);
  //     if (!data || !offsetWH || !currentPath) return false;
  //     setDragType(DragTypes.draging);
  //     if (node?.style?.zIndex !== '999') {
  //       node.style.zIndex = '999';
  //     }
  //     const sourceParams = {
  //       e,
  //       source: {
  //         node: node,
  //         dragType: DragTypes.draging,
  //         path: currentPath,
  //         x: data?.x as number,
  //         y: data?.y as number,
  //         width: offsetWH?.width,
  //         height: offsetWH?.height
  //       }
  //     }
  //     const targetItem = dndManager.findNearest(sourceParams);
  //     rest.onMove && rest.onMove({ ...sourceParams, target: targetItem });
  //     notify(sourceParams, targetItem)
  //   };

  //   // 当前元素的拖拽事件
  //   const onEndHandle: DragEventHandler = (e, data) => {
  //     const node = data?.node;
  //     const offsetWH = getOffsetWH(node);
  //     if (!data || !offsetWH || !currentPath) return false;
  //     setDragType(DragTypes.dragEnd);
  //     node.style.zIndex = lastZIndexRef.current;
  //     const sourceParams = {
  //       e,
  //       source: {
  //         node: node,
  //         dragType: DragTypes.dragEnd,
  //         path: currentPath,
  //         x: data?.x as number,
  //         y: data?.y as number,
  //         width: offsetWH?.width,
  //         height: offsetWH?.height
  //       }
  //     }
  //     const targetItem = dndManager.findNearest(sourceParams);
  //     rest.onEnd && rest.onEnd({ ...sourceParams, target: targetItem });
  //     notify(sourceParams, targetItem)
  //   };

  //   // 触发订阅的事件
  //   const notify = (source: SourceParams, target?: TargetParams) => {
  //     // 只有有碰撞元素才会触发
  //     if (source) {
  //       const result = {
  //         ...source,
  //         target: target
  //       };
  //       dndManager.notifyEvent(result)
  //     }
  //   }

  //   const cls = classNames((children?.props?.className || ''), className);
  //   const isDrag = dragType && [DragTypes.draging, DragTypes.dragStart]?.includes(dragType);

  //   return (
  //     <DraggableEvent
  //       ref={nodeRef}
  //       className={cls}
  //       direction={direction}
  //       disabled={!canDrag()}
  //       onStart={onStartHandle}
  //       onMove={onMoveHandle}
  //       onEnd={onEndHandle}
  //       style={{
  //         ...style,
  //         // visibility: isDrag ? 'hidden' : '',
  //         // transition: isDrag ? '' : 'all 0.2s'
  //       }}
  //     >
  //       <div>
  //         {children}
  //       </div>
  //     </DraggableEvent>
  //   );
  // });

  return class DndCore extends React.Component<DndProps> {
    sortArea: any;
    dragged: any;
    cloneDragged: any;
    over: any;
    lastDisplay?: CSSProperties['display'];
    constructor(props: DndProps) {
      super(props)
      this.state = {
        dragType: undefined
      }
    }

    static defaultProps = {
      direction: DragDirectionCode
    }

    componentDidMount() {

    }

    componentWillUnmount() {
      removeEvent(this.sortArea, 'dragover', this.onDragOverHandle);
    }

    // 初始化获取拖拽容器元素
    initArea = () => {

    }

    onStartHandle: EventHandler = (e, data) => {
      e.stopPropagation()
      const currentTarget = e.currentTarget as HTMLElement;
      if (currentTarget) {
        currentTarget.draggable = true;
        this.lastDisplay = css(currentTarget)?.display;
      }
    }

    onEndHandle: EventHandler = (e, data) => {
      e.stopPropagation()
      const currentTarget = e.currentTarget as HTMLElement;
      if (currentTarget) {
        currentTarget.draggable = false;
      }
    }

    onDragStartHandle = (e: any) => {
      e.stopPropagation()
      const currentTarget = e.currentTarget as HTMLElement;
      if (currentTarget) {
        const cloneDragged = currentTarget.cloneNode(true);
        this.dragged = currentTarget;
        this.cloneDragged = cloneDragged;
        // dataTransfer.setData把拖动对象的数据存入其中，可以用dataTransfer.getData来获取数据
        e.dataTransfer.setData("data", e.target.innerText);
        // this.props.onStart && this.props.onStart({});
        addEvent(this.sortArea, 'dragover', this.onDragOverHandle);
      }
    }

    onDragEndHandle = (e: any) => {
      e.stopPropagation()
      // 拖拽元素
      const dragged = this.dragged;
      // 克隆拖拽元素
      const cloneDragged = this.cloneDragged;
      // 目标元素
      const over = this.over;
      const from = getChildrenIndex(dragged, cloneDragged);
      const to = getChildrenIndex(cloneDragged, dragged);
      if (typeof from === 'number' && typeof to === 'number') {
        console.log(from, to, 'dragend');
      }
      // 重置
      dragged.draggable = undefined;
      over?.classList?.remove(OverClass.pre, OverClass.next);
      dragged.style.display = this.lastDisplay;
      cloneDragged?.parentNode?.removeChild?.(cloneDragged);
      removeEvent(this.sortArea, 'dragover', this.onDragOverHandle);
    }

    // 在同域内拖拽
    dragInSameArea = (newOver: any) => {
      const dragged = this.dragged;
      const cloneDragged = this.cloneDragged;
      const oldOver = this.over;
      // 添加拖拽副本
      if (dragged.style.display !== "none" && !isContains(this.sortArea, cloneDragged)) {
        insertAfter(cloneDragged, dragged);
      }
      dragged.style.display = "none";

      // 触发目标排除直接父元素与元素本身
      if (newOver === this.sortArea || newOver === dragged) {
        return;
      }

      // 只允许一个动画
      if (newOver?.animated) return;
      // 更换之前的初始位置
      const newOverPreRect = newOver.getBoundingClientRect();
      const draggedPreRect = cloneDragged.getBoundingClientRect();
      // 位置切换
      const draggedIndex = getChildrenIndex(cloneDragged, dragged);
      const newOverIndex = getChildrenIndex(newOver, dragged);
      const oldOverIndex = getChildrenIndex(oldOver, dragged);
      if (draggedIndex < newOverIndex) {
        insertAfter(cloneDragged, newOver);
        newOver.classList.add(OverClass.pre);
        this.over = newOver;
      } else {
        // 目标比元素小，插到其前面
        insertBefore(cloneDragged, newOver);
        newOver.classList.add(OverClass.next);
        this.over = newOver;
      }
      // 添加动画
      _animate(cloneDragged, draggedPreRect);
      _animate(newOver, newOverPreRect);
      if (oldOver && newOverIndex !== oldOverIndex) {
        oldOver.classList.remove(OverClass.pre, OverClass.next);
      }
    }

    onDragOverHandle = (e: any) => {
      // over默认行为阻止
      e.preventDefault();
      // 阻止冒泡
      e.stopPropagation();
      const dragged = this.dragged;
      const newOver = e.target;

      console.log(newOver)

      if (dragged) {
        // 同域内
        // this.dragInSameArea(newOver);
      }
    }

    renderChild(child: any) {
      const { direction } = this.props;
      return (
        <DraggableEvent
          onStart={this.onStartHandle}
          onEnd={this.onEndHandle}
          direction={direction}
          showLayer={false}
          childProps={{
            ...child.props,
            onDragStart: this.onDragStartHandle,
            onDragEnd: this.onDragEndHandle
          }}
        >
          {child}
        </DraggableEvent>
      );
    }

    render() {
      const { children, className, style } = this.props;
      const cls = classNames((children?.props?.className || ''), className);

      return (
        <div ref={(node: any) => this.sortArea = node} className={cls} style={style}>
          {
            React.Children.map(children, (child) => {
              if (child) {
                return this.renderChild(child);
              }
            })
          }
        </div>
      )
    }
  }
};