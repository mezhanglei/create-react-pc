import React, { CSSProperties, RefObject } from 'react';
import { DragDirectionCode, DraggableEvent, EventHandler } from "@/components/react-free-draggable";
import { DndSortableProps, DropEffect, DndParams, DndHandle, EventType } from "./utils/types";
import classNames from "classnames";
import { css, addEvent, getChildrenIndex, insertAfter, insertBefore, removeEvent, getOwnerDocument, getClientXY } from "@/utils/dom";
import { DndManager } from './manager';
import { createAnimate, isMoveIn } from './utils/dom';
import { isMobile } from '@/utils/brower';
import { isDisabledDrop, isDisabledSort, isDisabledDrag, isHiddenFrom, setMouseEvent } from './utils/utils';
import { isEqual } from '@/utils/object';

const ismobile = isMobile();
export default function BuildDndSortable() {

  const dndManager = new DndManager();

  return class DndSortable extends React.Component<DndSortableProps> {
    parentElRef?: RefObject<HTMLDivElement>;
    dragged?: HTMLElement;
    cloneDragged?: HTMLElement;
    over?: HTMLElement;
    lastDisplay: CSSProperties['display'];
    constructor(props: DndSortableProps) {
      super(props);
      this.parentElRef = React.createRef()
      this.state = {
      };
    }

    componentDidMount() {
      const parentEl = this.parentElRef?.current;
      this.initManagerData(parentEl);
    }

    componentDidUpdate(prevProps: DndSortableProps) {
      setTimeout(() => {
        const parentEl = this.parentElRef?.current;
        this.initManagerData(parentEl);
      }, 0);
    }

    static getDerivedStateFromProps(nextProps: DndSortableProps, prevState: any) {
      const optionsChanged = !isEqual(nextProps.options, prevState.prevOptions);
      if (optionsChanged) {
        return {
          ...prevState,
          prevOptions: nextProps.options
        };
      }
      return null;
    }

    componentWillUnmount() {
      const parentEl = this.parentElRef?.current;
      const ownerDocument = getOwnerDocument(parentEl);
      removeEvent(ownerDocument, 'dragover', this.onDragOver);
    }

    // 初始化manager的数据
    initManagerData = (parentEl?: HTMLElement | null) => {
      if (!parentEl) return;
      const props = this.props;
      const childNodes = parentEl?.children;
      const len = childNodes?.length;
      // 初始化可拖拽元素
      for (let i = 0; i < len; i++) {
        const childNode = childNodes?.[i] as HTMLElement;
        const dataId = childNode?.dataset?.id;
        dndManager.setDragItemsMap(childNode, {
          node: childNode,
          id: dataId,
          index: i,
          group: {
            node: parentEl,
            ...props
          }
        });
      }
      // 初始化可拖放元素
      dndManager.setDropItemsMap(parentEl, {
        group: {
          node: parentEl,
          ...props
        }
      });
    }

    handleMoveStart = (e: any, currentTarget: HTMLElement) => {
      const cloneDragged = currentTarget.cloneNode(true) as HTMLElement;
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

    // 鼠标点击/触摸事件开始
    onStart: EventHandler = (e) => {
      const currentTarget = e.currentTarget as HTMLElement;
      const target = e.target as HTMLElement;
      const dragItem = dndManager.getDragItem(currentTarget);
      const targetItem = dndManager.getDragItem(target);
      if (currentTarget && dragItem) {
        // 是否正在拖拽的目标
        const isTarget = targetItem ? target === currentTarget : currentTarget.contains(target);
        const disabledDrag = isDisabledDrag({ e, from: dragItem });
        if (!disabledDrag && isTarget) {
          currentTarget.draggable = true;
          this.lastDisplay = css(currentTarget)?.display;
          if (ismobile) {
            this.handleMoveStart(e, currentTarget)
          }
        }
      }
    }

    // 移动事件(移动端)
    onMove: EventHandler = (e) => {
      if (!ismobile) return
      this.moveHandle(e);
    }

    // 鼠标点击/触摸事件结束
    onEnd: EventHandler = (e) => {
      if (!ismobile) return
      if (this.dragged) {
        this.onEndHandle(e)
      }
    }

    // 鼠标拖拽开始事件(鼠标端，并且触发时其他事件将不会再触发)
    onDragStart = (e: any) => {
      const currentTarget = e.currentTarget as HTMLElement;
      const target = e.target;
      const isTarget = target === currentTarget;
      const parentEl = this.parentElRef?.current;
      if (currentTarget && isTarget) {
        this.handleMoveStart(e, currentTarget);
        const ownerDocument = getOwnerDocument(parentEl);
        addEvent(ownerDocument, 'dragover', this.onDragOver);
      }
    }

    // 鼠标dragOver事件(鼠标端)
    onDragOver = (e: any) => {
      setMouseEvent(e, 'dragover', DropEffect.Move)
      this.moveHandle(e);
    }

    // 拖拽结束事件(鼠标)
    onDragEnd = (e: any) => {
      this.onEndHandle(e)
    }

    // 鼠标拖拽结束事件
    onEndHandle = (e: EventType) => {
      // 拖拽元素
      const dragged = this.dragged;
      // 克隆拖拽元素
      const cloneDragged = this.cloneDragged;
      if (!cloneDragged) return;
      // 目标元素
      const over = this.over;
      const parentEl = this.parentElRef?.current;
      const dragItem = dndManager.getDragItem(dragged);
      const toItem = over && dndManager.getDragItem(over);
      const toGroup = over && dndManager.getDropItem(over);
      const to = (toItem || toGroup);
      const dropGroup = to?.group;
      const toIndex = getChildrenIndex(cloneDragged, [dragged]);
      const params = {
        e,
        from: {
          ...dragItem,
          clone: cloneDragged
        },
        to: { ...to, index: toIndex }
      }
      this.reset(params);
      if (dropGroup) {
        // 是否为同域排序
        if (dropGroup?.node === parentEl) {
          dropGroup.onUpdate && dropGroup.onUpdate(params);
        } else {
          // 跨域排序
          dropGroup?.onAdd && dropGroup?.onAdd(params);
        }
        // 结束时移除hover状态
        over && dropGroup?.onUnHover && dropGroup.onUnHover(over);
      }
      this.props.onEnd && this.props.onEnd(params);
    }

    reset: DndHandle = (params) => {
      const { to } = params;
      const dragged = this.dragged;
      const cloneDragged = this.cloneDragged;
      const over = this.over;
      const parentEl = this.parentElRef?.current;
      const toOptions = to?.group?.options;
      const overPreClass = toOptions?.sortPreClass || 'over-pre';
      const overNextClass = toOptions?.sortNextClass || 'over-next';
      // 拖拽结束后dom变换
      if (cloneDragged && dragged) {
        if (dragged?.draggable) {
          dragged.draggable = false;
          if (this.lastDisplay) {
            dragged.style.display = this.lastDisplay;
          }
        }
        cloneDragged?.parentNode?.removeChild?.(cloneDragged);
      }
      // 重置被hover的元素样式
      over?.classList?.remove(overNextClass, overPreClass);
      this.over = undefined;
      this.cloneDragged = undefined;
      this.dragged = undefined;
      const ownerDocument = getOwnerDocument(parentEl);
      removeEvent(ownerDocument, 'dragover', this.onDragOver);
    }

    handleDragOverClass = (overInfo: { draggedIndex: number, newOverIndex: number, oldOverIndex: number, newOver: HTMLElement, oldOver?: HTMLElement }, params: DndParams) => {
      const { draggedIndex, newOverIndex, oldOverIndex, newOver, oldOver } = overInfo;
      const toGroup = params?.to?.group;
      if (!toGroup) return;
      const { onHover, onUnHover } = toGroup;
      const toOptions = toGroup?.options;
      const overPreClass = toOptions?.sortPreClass || 'over-pre';
      const overNextClass = toOptions?.sortNextClass || 'over-next';
      newOver.classList.remove(overPreClass, overNextClass);
      if (draggedIndex < newOverIndex) {
        newOver.classList.add(overPreClass);
        onHover && onHover(newOver);
      } else {
        newOver.classList.add(overNextClass);
        onHover && onHover(newOver);
      }
      if (oldOver && newOverIndex !== oldOverIndex) {
        oldOver.classList.remove(overNextClass, overPreClass);
        onUnHover && onUnHover(oldOver);
      }
    }

    handleDisabledSort(params: DndParams) {
      const cloneDragged = this.cloneDragged;
      if (!cloneDragged) return;
      const disabledSort = isDisabledSort(params);
      if (disabledSort) {
        if (cloneDragged.style.display !== 'none') {
          cloneDragged.style.display = "none";
        }
      } else {
        cloneDragged.style.display = this.lastDisplay || ''
      }
    }

    // 移动过程中的事件处理
    moveHandle: EventHandler = (e) => {
      const dragged = this.dragged;
      const cloneDragged = this.cloneDragged;
      const parentEl = this.parentElRef?.current;
      if (!dragged || !cloneDragged || !parentEl) return
      // 经过的节点
      const isOverSelf = isMoveIn(e, cloneDragged) || isMoveIn(e, dragged);
      const target = dndManager.findOver(e, dragged, isOverSelf);
      const dragItem = dndManager.getDragItem(dragged);
      // 触发目标
      if (dragItem) {
        const toItem = target && dndManager.getDragItem(target);
        const toGroup = target && dndManager.getDropItem(target);
        const to = (toItem || toGroup);
        const dropGroup = to?.group;
        const params = {
          e,
          from: {
            ...dragItem,
            clone: cloneDragged
          },
          to: to
        };
        const hiddenFrom = isHiddenFrom(params)
        if (hiddenFrom && dragged.style.display !== 'none') {
          dragged.style.display = "none";
          insertAfter(cloneDragged, dragged);
        }
        if (!isOverSelf) {
          // 拖放行为是否在同域内
          if (dropGroup?.node === parentEl) {
            this.handleDisabledSort(params);
            if (toItem) {
              this.sortInSameArea(params);
            } else {
              this.setDropEndChild(params);
            }
          } else if (dropGroup) {
            const disabledDrop = isDisabledDrop(params);
            if (!disabledDrop) {
              this.handleDisabledSort(params);
              this.addNewOver(params);
            }
          }
        }
        this.props.onMove && this.props.onMove(params);
      }
    }

    // 同区域内拖拽更新位置
    sortInSameArea = (params: DndParams) => {
      const { to } = params;
      const dragged = this.dragged;
      const cloneDragged = this.cloneDragged;
      const oldOver = this.over;
      const newOver = to?.node;
      // 只允许一个动画
      if (!newOver || !cloneDragged || newOver?.animated || newOver === oldOver) return;
      // 移动前创建动画实例记录位置和dom
      const executeAnimation = createAnimate(cloneDragged?.parentNode?.children);
      // 位置序号
      const draggedIndex = getChildrenIndex(cloneDragged, [dragged]);
      const newOverIndex = getChildrenIndex(newOver, [dragged]);
      const oldOverIndex = getChildrenIndex(oldOver, [dragged]);
      if (draggedIndex < newOverIndex) {
        insertAfter(cloneDragged, newOver);
        this.over = newOver;
      } else if (draggedIndex > newOverIndex) {
        insertBefore(cloneDragged, newOver);
        this.over = newOver;
      }
      this.handleDragOverClass({ draggedIndex, oldOverIndex, oldOver, newOver, newOverIndex }, params);
      // 执行动画
      executeAnimation();
    }

    // 跨域添加新元素
    addNewOver = (params: DndParams) => {
      const { to } = params;
      const dropGroup = to?.group;
      const dropGroupNode = dropGroup?.node;
      const cloneDragged = this.cloneDragged;
      const oldOver = this.over;
      const sortableOver = to?.node;
      if (!dropGroup || !cloneDragged) return;
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
          if (sortableOver?.animated || sortableOver === oldOver) return;
          // 创建动画实例记录移动前的dom和位置
          const executeAnimation = createAnimate(cloneDragged?.parentNode?.children);
          // 位置序号
          const draggedIndex = getChildrenIndex(cloneDragged);
          const newOverIndex = getChildrenIndex(sortableOver);
          const oldOverIndex = getChildrenIndex(oldOver);
          // 交换位置
          if (draggedIndex < newOverIndex) {
            insertAfter(cloneDragged, sortableOver)
            this.over = sortableOver;
          } else if (draggedIndex > newOverIndex) {
            insertBefore(cloneDragged, sortableOver);
            this.over = sortableOver;
          }
          this.handleDragOverClass({ draggedIndex, oldOverIndex, oldOver, newOver: sortableOver, newOverIndex }, params);
          // 执行动画
          executeAnimation();
        } else {
          // 在当前域内空白处时
          this.setDropEndChild(params)
        }
      }
    }

    // 判断是否添加在末尾
    setDropEndChild = (params: DndParams) => {
      const { e, from, to } = params;
      const cloneDragged = from.clone as HTMLElement & { animated?: boolean };
      const dropGroup = to?.group;
      const parent = dropGroup?.node;
      const oldOver = this.over;
      if (!parent || cloneDragged?.animated || parent === oldOver) return;
      const lastChild = parent.lastChild as HTMLElement;
      if (cloneDragged !== lastChild && lastChild) {
        const lastChildRect = lastChild.getBoundingClientRect();
        const cloneRect = cloneDragged.getBoundingClientRect();
        const eventRect = getClientXY(e);
        if (eventRect) {
          const isToBttomTail = cloneRect?.top < lastChildRect?.top && eventRect?.y > lastChildRect?.top;
          const isToRightTail = cloneRect?.left < lastChildRect?.left && eventRect?.x > lastChildRect?.left;
          if (isToBttomTail || isToRightTail) {
            const executeAnimation = createAnimate(cloneDragged?.parentNode?.children);
            parent?.appendChild(cloneDragged);
            executeAnimation();
          }
        }
        oldOver && dropGroup.onUnHover && dropGroup.onUnHover(oldOver);
        this.over = parent;
      }
    }

    renderChild(child: any) {
      const options = this.props?.options;

      return (
        <DraggableEvent
          handle={options?.handle}
          filter={options?.filter}
          onStart={this.onStart}
          onMove={this.onMove}
          onEnd={this.onEnd}
          direction={options?.direction || DragDirectionCode}
          onDragStart={this.onDragStart}
          onDragEnd={this.onDragEnd}
        >
          {child}
        </DraggableEvent>
      );
    }

    render() {
      const { children, className, style } = this.props;
      const cls = classNames((children?.props?.className || ''), className);
      const ref = this.parentElRef;
      return (
        <div ref={ref} className={cls} style={style}>
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
