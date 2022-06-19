import React, { CSSProperties } from 'react';
import { DragDirectionCode, DraggableEvent, EventHandler } from "@/components/react-free-draggable";
import { DndProps, DndSortable, SortableItem, DropEffect, EventType, DndBaseProps, DndParams, DragItem } from "./utils/types";
import classNames from "classnames";
import { css, addEvent, getChildrenIndex, insertAfter, insertBefore, removeEvent, isContains, getOwnerDocument, matches, getClientXY } from "@/utils/dom";
import { DndManager } from './dnd-manager';
import { createAnimate, isMoveIn } from './utils/dom';
import { isEventTouch, isMobile } from '@/utils/verify';
import { isEqual } from '@/utils/object';

const ismobile = isMobile();
export default function BuildDndSortable() {

  const dndManager = new DndManager();

  return class DndCore extends React.Component<DndProps> {
    sortArea: any;
    dragged: any;
    cloneDragged: any;
    over: HTMLElement | undefined;
    lastDisplay: CSSProperties['display'];
    constructor(props: DndProps) {
      super(props);
      this.state = {
      };
    }

    componentDidMount() {
      setTimeout(() => {
        this.initManagerData();
      }, 0);
    }

    componentWillUnmount() {
      const ownerDocument = getOwnerDocument(this.sortArea);
      removeEvent(ownerDocument, 'dragover', this.onDragOver);
    }

    // 当父组件的state数据改变时触发更新
    componentDidUpdate(prevProps: DndProps) {
      if (this.props.options !== undefined) {
        // 异步更新
        setTimeout(() => {
          this.initManagerData();
        }, 0);
      }
    }

    static getDerivedStateFromProps(nextProps: DndProps, prevState: any) {
      const optionsChanged = !isEqual(nextProps.options, prevState.prevOptions);
      if (optionsChanged) {
        return {
          ...prevState,
          prevOptions: nextProps.options
        };
      }
      return null;
    }

    // 获取options
    getOptions = (options: DndProps['options']): DndProps['options'] => {
      const defaultOptions = {
        childDrag: true,
        childOut: true,
        allowDrop: true,
        allowSort: true,
        direction: DragDirectionCode,
        sortPreClass: 'over-pre',
        sortNextClass: 'over-next'
      };
      const newOptions = { ...defaultOptions, ...options };
      return newOptions;
    }

    // 初始化manager的数据
    initManagerData = () => {
      const sortArea = this.sortArea;
      if (!sortArea) return;
      const { children, className, style, ...restProps } = this.props;
      const options = this.getOptions(restProps?.options);
      const childNodes = sortArea?.children;
      const includeChild = options?.childDrag instanceof Array ? options?.childDrag : [];
      const parentPath = options?.groupPath;
      // 初始化可拖拽元素
      children?.map((child: any, index: number) => {
        const childNode = childNodes?.[index];
        const path = parentPath !== undefined ? `${parentPath}.${index}` : `${index}`;
        dndManager.setDragItemsMap({
          groupPath: parentPath,
          groupNode: sortArea,
          props: restProps,
          item: childNode,
          index,
          path: path,
          draggableIndex: getChildrenIndex(childNode, undefined, includeChild)
        });
      });
      // 初始化可拖放元素
      dndManager.setDropItemsMap({
        groupPath: parentPath,
        groupNode: sortArea,
        props: restProps
      });
    }

    isChildDrag = (item: DragItem, options: DndProps['options']) => {
      const childDrag = options?.childDrag;
      const dragNode = item?.item;
      if (typeof childDrag == 'boolean') {
        return childDrag;
      } if (typeof childDrag === 'function') {
        return childDrag(item, options);
      } else if (childDrag instanceof Array) {
        return childDrag?.some((item) => typeof item === 'string' ? matches(dragNode, item) : dragNode === item);
      }
    }

    isChildOut = (params: DndParams, options: DndProps['options']) => {
      const childOut = options?.childOut;
      const dragNode = params?.from?.item;
      if (typeof childOut == 'boolean') {
        return childOut;
      } if (typeof childOut === 'function') {
        return childOut(params, options);
      } else if (childOut instanceof Array) {
        return childOut?.some((item) => typeof item === 'string' ? matches(dragNode, item) : dragNode === item);
      }
    }

    isCanSort = (params: DndParams, options: DndProps['options']) => {
      const childSort = options?.allowSort;
      if (typeof childSort == 'boolean') {
        return childSort;
      } if (typeof childSort === 'function') {
        return childSort(params, options);
      }
    }

    isCanDrop = (params: DndParams, options: DndProps['options']) => {
      const childDrop = options?.allowDrop;
      if (typeof childDrop == 'boolean') {
        return childDrop;
      } if (typeof childDrop === 'function') {
        return childDrop(params, options);
      }
    }

    // 鼠标点击/触摸事件开始
    onStart: EventHandler = (e: any) => {
      // 移动端处理冒泡
      if (isEventTouch(e)) {
        e.stopPropagation();
      }
      const currentTarget = e.currentTarget;
      const dragItem = dndManager.getDragItem(currentTarget);
      const options = this.getOptions(this.props?.options);
      if (currentTarget && dragItem && this.isChildDrag(dragItem, options)) {
        currentTarget.draggable = true;
        this.lastDisplay = css(currentTarget)?.display;
      }
    }

    // 鼠标点击/触摸事件结束
    onEnd: EventHandler = (e: any) => {
      if (isEventTouch(e)) {
        e.stopPropagation();
      }
      if (this.dragged) {
        this.onDragEnd(e)
      }
    }

    // 鼠标拖拽结束事件
    onDragEnd = (e: any) => {
      e.stopPropagation();
      // 拖拽元素
      const dragged = this.dragged;
      // 克隆拖拽元素
      const cloneDragged = this.cloneDragged;
      // 目标元素
      const over = this.over;
      const sortArea = this.sortArea;
      const dragItem = dndManager.getDragItem(dragged);
      const overItem = over && (dndManager.getDragItem(over) || dndManager.getDropItem(over)) as any;
      if (dragItem) {
        const params = {
          e,
          from: {
            ...dragItem,
            clone: cloneDragged
          },
          to: overItem
        }
        const dropGroup = dndManager.getDropItem(overItem?.groupNode);
        if (dropGroup) {
          const props = dropGroup?.props;
          const options = this.getOptions(props?.options);
          const canSort = this.isCanSort(params, options);
          const isChildOut = this.isChildOut(params, options);
          if (canSort) {
            overItem.index = getChildrenIndex(cloneDragged, [dragged]);
          }
          // 是否为同域排序
          if (overItem?.groupNode === sortArea) {
            // 结束时移除hover状态
            over && props?.onUnHover && props.onUnHover(over);
            props.onUpdate && props.onUpdate(params);
          } else if (isChildOut) {
            // 跨域排序
            if (dropGroup) {
              // 结束时移除hover状态
              over && props?.onUnHover && props?.onUnHover(over);
              props?.onAdd && props?.onAdd(params);
            }
          }
        }
        this.props.onEnd && this.props.onEnd(params);
      }
      this.sortEnd();
    }

    sortEnd = () => {
      // 拖拽元素
      const dragged = this.dragged;
      // 克隆拖拽元素
      const cloneDragged = this.cloneDragged;
      // 目标元素
      const over = this.over;
      const sortArea = this.sortArea;
      const options = this.getOptions(this.props.options);
      const sortPreClass = options?.sortPreClass || '';
      const sortNextClass = options?.sortNextClass || '';
      // 重置
      if (dragged) {
        dragged.draggable = undefined;
        dragged.style.display = this.lastDisplay;
        this.dragged = undefined;
        cloneDragged.draggable = undefined;
        cloneDragged?.parentNode?.removeChild?.(cloneDragged);
        this.cloneDragged = undefined;
      }
      over?.classList?.remove(sortNextClass, sortPreClass);
      this.over = undefined;
      const ownerDocument = getOwnerDocument(sortArea);
      removeEvent(ownerDocument, 'dragover', this.onDragOver);
    }

    handleDragOverClass = (params: { draggedIndex: number, newOverIndex: number, oldOverIndex: number, newOver: HTMLElement, oldOver?: HTMLElement, props: DndBaseProps }) => {
      const { draggedIndex, newOverIndex, oldOverIndex, newOver, oldOver, props } = params;
      const { onHover, onUnHover } = props;
      const options = this.getOptions(props?.options);
      const sortPreClass = options?.sortPreClass || '';
      const sortNextClass = options?.sortNextClass || '';
      newOver.classList.remove(sortPreClass, sortNextClass);
      if (draggedIndex < newOverIndex) {
        newOver.classList.add(sortPreClass);
        onHover && onHover(newOver);
      } else {
        newOver.classList.add(sortNextClass);
        onHover && onHover(newOver);
      }
      if (oldOver && newOverIndex !== oldOverIndex) {
        oldOver.classList.remove(sortNextClass, sortPreClass);
        onUnHover && onUnHover(oldOver);
      }
    }

    // 鼠标拖拽开始事件(鼠标端，并且触发时其他事件将不会再触发)
    onDragStart = (e: any) => {
      e.stopPropagation();
      const currentTarget = e.currentTarget;
      if (currentTarget) {
        const ownerDocument = getOwnerDocument(this.sortArea);
        addEvent(ownerDocument, 'dragover', this.onDragOver);
      }
      this.moveStartHandle(e, currentTarget);
    }

    // 触摸拖拽开始事件(移动端)
    onTouchMoveStart: EventHandler = (e: any, data) => {
      const currentTarget = data?.node;
      this.moveStartHandle(e, currentTarget);
    }

    // 开始移动的事件处理
    moveStartHandle = (e: any, currentTarget?: any) => {
      if (currentTarget) {
        const cloneDragged = currentTarget.cloneNode(true);
        this.dragged = currentTarget;
        this.cloneDragged = cloneDragged;
        const dragItem = dndManager.getDragItem(currentTarget);
        if (dragItem) {
          const params = {
            e,
            from: {
              ...dragItem,
              clone: cloneDragged
            }
          };
          this.props.onStart && this.props.onStart(params);
        }
      }
    }

    // 移动过程中的事件处理
    moveHandle: EventHandler = (e: any) => {
      const dragged = this.dragged;
      const cloneDragged = this.cloneDragged;
      const sortArea = this.sortArea;
      // 添加拖拽副本
      if (dragged?.style?.display !== "none" && !isContains(sortArea, cloneDragged)) {
        insertAfter(cloneDragged, dragged);
      }
      dragged.style.display = "none";
      // 经过的节点
      const isOverSelf = isMoveIn(e, cloneDragged);
      const target = dndManager.findOver(e);
      const dragItem = dndManager.getDragItem(dragged);
      const options = this.getOptions(this.props.options);
      // 触发目标
      if (dragItem) {
        const overItem = target && (dndManager.getDragItem(target) || dndManager.getDropItem(target)) as any;
        const params = {
          e,
          from: {
            ...dragItem,
            clone: cloneDragged
          },
          to: overItem
        };
        const isChildOut = this.isChildOut(params, options);
        // 拖放行为是否在同域内
        if (overItem?.groupNode === sortArea) {
          if (!isOverSelf) {
            if (overItem?.item) {
              this.sortInSameArea(e, dragItem, overItem);
            } else {
              this.setDropEndChild(e, overItem, cloneDragged);
            }
          }
        } else if (isChildOut) {
          // 移动到新的容器内
          const dropGroup = dndManager.getDropItem(overItem?.groupNode);
          if (dropGroup) {
            const options = this.getOptions(dropGroup?.props?.options);
            const canDrop = this.isCanDrop(params, options);
            if (!canDrop) {
              // 鼠标的样式更改
              if (e.dataTransfer) {
                e.dataTransfer.dropEffect = DropEffect.None;
              }
              return;
            }
            this.addNewOver(e, dropGroup, overItem);
          }
        }
        this.props.onMove && this.props.onMove(params);
      }
    }

    // 移动事件(移动端)
    onTouchMove: EventHandler = (e) => {
      this.moveHandle(e);
    }

    // 鼠标dragOver事件(鼠标端)
    onDragOver = (e: any) => {
      // over默认行为阻止
      e.preventDefault();
      this.moveHandle(e);
    }

    // 同区域内拖拽更新位置
    sortInSameArea = (e: any, dragItem: SortableItem, dropItem: SortableItem) => {
      const dragged = this.dragged;
      const cloneDragged = this.cloneDragged;
      const oldOver = this.over;
      const newOver = dropItem?.item;
      // 只允许一个动画
      if (!newOver || newOver?.animated) return;
      // 移动前创建动画实例记录位置和dom
      const animateInstance = createAnimate(cloneDragged?.parentNode?.children);
      // 位置序号
      const draggedIndex = getChildrenIndex(cloneDragged, [dragged]);
      const newOverIndex = getChildrenIndex(newOver, [dragged]);
      const oldOverIndex = getChildrenIndex(oldOver, [dragged]);
      const options = this.getOptions(this.props?.options);
      const canSort = this.isCanSort({
        e,
        from: {
          ...dragItem,
          clone: cloneDragged
        },
        to: dropItem
      }, options);
      if (draggedIndex < newOverIndex) {
        canSort && insertAfter(cloneDragged, newOver);
        this.over = newOver;
      } else {
        // 目标比元素小，插到其前面
        canSort && insertBefore(cloneDragged, newOver);
        this.over = newOver;
      }
      this.handleDragOverClass({ draggedIndex, newOverIndex, oldOverIndex, oldOver, newOver, props: this.props });
      // 执行动画
      animateInstance();
    }

    // 跨域添加新元素
    addNewOver = (e: EventType, dropGroup: DndSortable, sortableItem?: SortableItem) => {
      const dropGroupNode = dropGroup?.groupNode;
      const cloneDragged = this.cloneDragged;
      const dragged = this.dragged;
      const options = this.getOptions(dropGroup.props.options);
      const oldOver = this.over;
      const sortableOver = sortableItem?.item;
      const dragItem = dndManager.getDragItem(dragged);
      const canSort = dragItem && this.isCanSort({
        e,
        from: {
          ...dragItem,
          clone: cloneDragged
        },
        to: sortableItem
      }, options);
      if (!canSort) {
        this.over = sortableOver || dropGroupNode;
        return;
      }
      if (!dropGroupNode?.contains(cloneDragged)) {
        if (sortableOver) {
          const animateInstance = createAnimate([sortableOver, cloneDragged]);
          insertBefore(cloneDragged, sortableOver)
          this.over = sortableOver
          animateInstance()
        } else {
          const animateInstance = createAnimate([cloneDragged]);
          dropGroupNode?.appendChild(cloneDragged);
          this.over = dropGroupNode;
          animateInstance();
        }
        // 插入新元素后的拖拽排序
      } else {
        if (sortableOver) {
          // 只允许一个动画
          if (sortableOver?.animated) return;
          // 创建动画实例记录移动前的dom和位置
          const animateInstance = createAnimate(cloneDragged?.parentNode?.children);
          // 位置序号
          const draggedIndex = getChildrenIndex(cloneDragged);
          const newOverIndex = getChildrenIndex(sortableOver);
          const oldOverIndex = getChildrenIndex(oldOver);
          // 交换位置
          if (draggedIndex < newOverIndex) {
            insertAfter(cloneDragged, sortableOver);
            this.over = sortableOver;
          } else {
            insertBefore(cloneDragged, sortableOver);
            this.over = sortableOver;
          }
          this.handleDragOverClass({ draggedIndex, newOverIndex, oldOverIndex, oldOver, newOver: sortableOver, props: dropGroup?.props });
          // 执行动画
          animateInstance();
        } else {
          this.setDropEndChild(e, dropGroup, cloneDragged)
        }
      }
    }

    // 判断是否添加在末尾
    setDropEndChild = (e: EventType, dropGroup: DndSortable, cloneDragged: HTMLElement & { animated?: boolean }) => {
      // 当正在运动时禁止
      if (cloneDragged?.animated) return;
      const parent = dropGroup?.groupNode;
      const lastChild = parent.lastChild as HTMLElement;
      const props = dropGroup.props;
      const options = this.getOptions(props.options);
      const dragged = this.dragged;
      if (cloneDragged !== lastChild && lastChild) {
        const lastChildRect = lastChild.getBoundingClientRect();
        const cloneRect = cloneDragged.getBoundingClientRect();
        const eventRect = getClientXY(e);
        const dragItem = dndManager.getDragItem(dragged);
        const canSort = dragItem && this.isCanSort({
          e,
          from: {
            ...dragItem,
            clone: cloneDragged
          }
        }, options);
        if (canSort && eventRect) {
          const isToBttom = cloneRect?.top < lastChildRect?.top && eventRect?.y > lastChildRect?.top;
          const isToRight = cloneRect?.left < lastChildRect?.left && eventRect?.x > lastChildRect?.left;
          if (isToBttom || isToRight) {
            const animateInstance = createAnimate(cloneDragged?.parentNode?.children);
            parent?.appendChild(cloneDragged);
            animateInstance();
          }
        }
        const oldOver = this.over;
        oldOver && props.onUnHover && props.onUnHover(oldOver);
        this.over = parent;
      }
    }

    renderChild(child: any) {
      const options = this.getOptions(this.props?.options);

      return (
        <DraggableEvent
          handle={options?.handle}
          filter={options?.filter}
          onStart={this.onStart}
          onMoveStart={ismobile ? this.onTouchMoveStart : undefined}
          onMove={ismobile ? this.onTouchMove : undefined}
          onEnd={this.onEnd}
          direction={options?.direction}
          showLayer={ismobile ? true : false}
          childProps={{
            ...child.props,
            onDragStart: this.onDragStart,
            onDragEnd: this.onDragEnd
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
      );
    }
  };
};
