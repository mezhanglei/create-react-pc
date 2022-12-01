import React, { CSSProperties } from 'react';
import { DragDirectionCode, DraggableEvent, EventHandler } from "@/components/react-free-draggable";
import { DndProps, DropEffect, DndBaseProps, DndParams } from "./utils/types";
import classNames from "classnames";
import { css, addEvent, getChildrenIndex, insertAfter, insertBefore, removeEvent, isContains, getOwnerDocument, getClientXY } from "@/utils/dom";
import { DndManager } from './dnd-manager';
import { createAnimate, isMoveIn } from './utils/dom';
import { isEventTouch, isMobile } from '@/utils/verify';
import { isCanDrop, isCanSort, isChildDrag, isChildOut } from './utils/utils';
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
        this.initManagerData(this.sortArea);
      }, 0);
    }

    componentDidUpdate(prevProps: DndProps) {
      if (!this.over) {
        setTimeout(() => {
          this.initManagerData(this.sortArea);
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

    componentWillUnmount() {
      const ownerDocument = getOwnerDocument(this.sortArea);
      removeEvent(ownerDocument, 'dragover', this.onDragOver);
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
    initManagerData = (sortArea: any) => {
      if (!sortArea) return;
      const props = this.props;
      const childNodes = sortArea?.children;
      const len = childNodes?.length
      // 初始化可拖拽元素
      for (let i = 0; i < len; i++) {
        const childNode = childNodes?.[i];
        const dataId = childNode?.dataset?.id;
        dndManager.setDragItemsMap(childNode, {
          node: childNode,
          id: dataId,
          index: i,
          group: {
            node: sortArea,
            ...props
          }
        });
      }
      // 初始化可拖放元素
      dndManager.setDropItemsMap(sortArea, {
        group: {
          node: sortArea,
          ...props
        }
      });
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
      if (currentTarget && dragItem && isChildDrag(dragItem, options)) {
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
      const toItem = over && dndManager.getDragItem(over);
      const toGroup = over && dndManager.getDropItem(over);
      const to = (toItem || toGroup)
      const dropGroup = to?.group;
      if (dragItem) {
        const params = {
          e,
          from: {
            ...dragItem,
            clone: cloneDragged
          },
          to: to
        }
        if (dropGroup) {
          const options = this.getOptions(dropGroup?.options);
          const canSort = isCanSort(params, options);
          const childOut = isChildOut(params, options);
          if (canSort) {
            // 需要手动变更序号
            to.index = getChildrenIndex(cloneDragged, [dragged]);
          }
          // 是否为同域排序
          if (dropGroup?.node === sortArea) {
            dropGroup.onUpdate && dropGroup.onUpdate(params);
          } else if (childOut) {
            // 跨域排序
            dropGroup?.onAdd && dropGroup?.onAdd(params);
          }
          // 结束时移除hover状态
          over && dropGroup?.onUnHover && dropGroup.onUnHover(over);
        }
        this.props.onEnd && this.props.onEnd(params);
      }
      this.reset();
    }

    reset = () => {
      const dragged = this.dragged;
      const cloneDragged = this.cloneDragged;
      const over = this.over;
      const sortArea = this.sortArea;
      const options = this.getOptions(this.props.options);
      const sortPreClass = options?.sortPreClass || '';
      const sortNextClass = options?.sortNextClass || '';
      // 重置源
      if (dragged) {
        dragged.draggable = undefined;
        dragged.style.display = this.lastDisplay;
        this.dragged = undefined;
      }
      // 重置克隆
      if (cloneDragged) {
        cloneDragged.draggable = undefined;
        cloneDragged?.parentNode?.removeChild?.(cloneDragged);
        this.cloneDragged = undefined;
      }
      // 重置被hover的元素样式
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
      const target = dndManager.findOver(e, dragged, isOverSelf);
      const dragItem = dndManager.getDragItem(dragged);
      const options = this.getOptions(this.props.options);
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
        const childOut = isChildOut(params, options);
        // 拖放行为是否在同域内
        if (dropGroup?.node === sortArea) {
          if (!isOverSelf) {
            if (toItem) {
              this.sortInSameArea(params);
            } else {
              this.setDropEndChild(params);
            }
          }
        } else if (childOut) {
          if (dropGroup) {
            const options = this.getOptions(dropGroup?.options);
            const canDrop = isCanDrop(params, options);
            if (!canDrop) {
              // 鼠标的样式更改
              if (e.dataTransfer) {
                e.dataTransfer.dropEffect = DropEffect.None;
              }
              return;
            }
            if (!isOverSelf) {
              this.addNewOver(params);
            }
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
      // e.preventDefault();
      this.moveHandle(e);
    }

    // 同区域内拖拽更新位置
    sortInSameArea = (params: DndParams) => {
      const { to } = params;
      const dragged = this.dragged;
      const cloneDragged = this.cloneDragged;
      const oldOver = this.over;
      const newOver = to?.node;
      // 只允许一个动画
      if (!newOver || newOver?.animated) return;
      // 移动前创建动画实例记录位置和dom
      const animateInstance = createAnimate(cloneDragged?.parentNode?.children);
      // 位置序号
      const draggedIndex = getChildrenIndex(cloneDragged, [dragged]);
      const newOverIndex = getChildrenIndex(newOver, [dragged]);
      const oldOverIndex = getChildrenIndex(oldOver, [dragged]);
      const options = this.getOptions(this.props?.options);
      const canSort = isCanSort(params, options);
      if (draggedIndex < newOverIndex) {
        canSort && insertAfter(cloneDragged, newOver);
        this.over = newOver;
      } else if (draggedIndex > newOverIndex) {
        // 目标比元素小，插到其前面
        canSort && insertBefore(cloneDragged, newOver);
        this.over = newOver;
      }
      this.handleDragOverClass({ draggedIndex, newOverIndex, oldOverIndex, oldOver, newOver, props: this.props });
      // 执行动画
      animateInstance();
    }

    // 跨域添加新元素
    addNewOver = (params: DndParams) => {
      const { to } = params;
      const dropGroup = to?.group;
      if (!dropGroup) return;
      const dropGroupNode = dropGroup?.node;
      const cloneDragged = this.cloneDragged;
      const options = this.getOptions(dropGroup.options);
      const oldOver = this.over;
      const sortableOver = to?.node;
      const canSort = isCanSort(params, options);
      if (!dropGroupNode?.contains(cloneDragged)) {
        if (sortableOver) {
          const animateInstance = createAnimate([sortableOver, cloneDragged]);
          canSort && insertBefore(cloneDragged, sortableOver)
          this.over = sortableOver
          animateInstance()
        } else {
          const animateInstance = createAnimate([cloneDragged]);
          canSort && dropGroupNode?.appendChild(cloneDragged);
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
            canSort && insertAfter(cloneDragged, sortableOver);
            this.over = sortableOver;
          } else if (draggedIndex > newOverIndex) {
            canSort && insertBefore(cloneDragged, sortableOver);
            this.over = sortableOver;
          }
          this.handleDragOverClass({ draggedIndex, newOverIndex, oldOverIndex, oldOver, newOver: sortableOver, props: dropGroup });
          // 执行动画
          animateInstance();
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
      if (!dropGroup) return;
      // 当正在运动时禁止
      if (cloneDragged?.animated) return;
      const parent = dropGroup?.node;
      const lastChild = parent.lastChild as HTMLElement;
      const options = this.getOptions(dropGroup.options);
      if (cloneDragged !== lastChild && lastChild) {
        const lastChildRect = lastChild.getBoundingClientRect();
        const cloneRect = cloneDragged.getBoundingClientRect();
        const eventRect = getClientXY(e);
        const canSort = isCanSort(params, options);
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
        oldOver && dropGroup.onUnHover && dropGroup.onUnHover(oldOver);
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
          onDragStart={this.onDragStart}
          onDragEnd={this.onDragEnd}
          direction={options?.direction}
          showLayer={ismobile ? true : false}
          {...child.props}
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
