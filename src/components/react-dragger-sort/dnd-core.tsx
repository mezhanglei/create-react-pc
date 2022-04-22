import React, { CSSProperties } from 'react';
import { DragDirectionCode, DraggableEvent, EventHandler } from "@/components/react-free-draggable";
import { DndProps, DndSortable, SortableItem, DropEffect, EventType, DndBaseProps } from "./utils/types";
import classNames from "classnames";
import { css, addEvent, getChildrenIndex, insertAfter, insertBefore, removeEvent, isContains, getOwnerDocument, matches } from "@/utils/dom";
import { DndManager } from './dnd-manager';
import { _animate } from './utils/dom';
import { isMobile } from '@/utils/verify';
import { isObjectEqual } from '@/utils/object';

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
      this.initManagerData();
    }

    componentWillUnmount() {
      const ownerDocument = getOwnerDocument(this.sortArea);
      removeEvent(ownerDocument, 'dragover', this.onDragOver);
    }

    // 当外部的state数据改变时触发更新
    componentDidUpdate(prevProps: DndProps) {
      if (this.props.options !== undefined) {
        // 异步更新
        setTimeout(() => {
          this.initManagerData();
        }, 0);
      }
    }

    static getDerivedStateFromProps(nextProps: DndProps, prevState: any) {
      const optionsChanged = !isObjectEqual(nextProps.options, prevState.prevOptions);
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
        allowDrop: true,
        allowSort: true,
        direction: DragDirectionCode,
        sortSmallClass: 'over-pre',
        sortBigClass: 'over-next'
      };
      const newOptions = { ...defaultOptions, ...options };
      return newOptions;
    }

    // 初始化manager的数据
    initManagerData = () => {
      if (!this.sortArea) return;
      const { children, className, style, ...restProps } = this.props;
      const options = this.getOptions(restProps?.options);
      const childNodes = this.sortArea?.children;
      const childDrag = options?.childDrag instanceof Array ? options?.childDrag : [];
      const parentPath = options?.groupPath;
      // 初始化可拖拽元素
      children?.map((child: any, index: number) => {
        const childNode = childNodes?.[index];
        const path = parentPath !== undefined ? `${parentPath}.${index}` : `${index}`;
        dndManager.setDragItemsMap({
          groupPath: parentPath,
          groupNode: this.sortArea,
          props: restProps,
          item: childNode,
          index,
          path: path,
          draggableIndex: getChildrenIndex(childNode, undefined, childDrag)
        });
      });
      // 初始化可拖放元素
      dndManager.setDropItemsMap({
        groupPath: parentPath,
        groupNode: this.sortArea,
        props: restProps
      });
    }

    isCanDrag = (el: HTMLElement, options: DndProps['options']) => {
      const opt = this.getOptions(options);
      const childDrag = opt?.childDrag;
      if (typeof childDrag == 'boolean') {
        return childDrag;
      } else if (childDrag instanceof Array) {
        return childDrag?.some((item) => typeof item === 'string' ? matches(el, item) : el === item);
      }
    }

    // 鼠标点击/触摸事件开始
    onStart: EventHandler = (e: any) => {
      e.stopPropagation();
      const currentTarget = e.currentTarget;
      if (currentTarget && this.isCanDrag(currentTarget, this.props?.options)) {
        currentTarget.draggable = true;
        this.lastDisplay = css(currentTarget)?.display;
      }
    }

    // 鼠标点击/触摸事件结束
    onEnd: EventHandler = (e: any) => {
      this.onDragEnd(e)
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
      const overSortableItem = over && dndManager.getDragItem(over); // 目标可排序元素
      const dropItem = over && dndManager.getDropItem(over); // 目标可添加元素
      if (dragItem) {
        const dragParams = {
          e,
          drag: {
            ...dragItem,
            clone: cloneDragged
          }
        };
        // 是否为同域排序
        if (overSortableItem && overSortableItem?.groupNode === sortArea || over == sortArea || dragged.contains(over)) {
          const props = this.props;
          const options = this.getOptions(props.options);
          const dropIndex = options?.allowSort ? getChildrenIndex(cloneDragged, [dragged]) : overSortableItem?.index; // drop目标的位置index
          overSortableItem?.item && props?.onUnHover && props.onUnHover(overSortableItem?.item);
          props.onUpdate && props.onUpdate({ ...dragParams, drop: { ...dropItem, ...overSortableItem, dropIndex } });
        } else {
          // 跨域排序
          if (dropItem || overSortableItem) {
            const dropGroup = overSortableItem ? dndManager.getDropItem(overSortableItem?.groupNode) : dropItem;
            if (dropGroup) {
              const props = dropGroup?.props;
              const options = this.getOptions(props?.options);
              const dropIndex = options?.allowSort ? getChildrenIndex(cloneDragged, [dragged]) : overSortableItem?.index; // drop目标的位置index
              overSortableItem?.item && props?.onUnHover && props?.onUnHover(overSortableItem?.item);
              props?.onAdd && props?.onAdd({
                ...dragParams,
                drop: { ...dropGroup, ...overSortableItem, dropIndex }
              });
            }
          }
        }
        this.props.onEnd && this.props.onEnd({ ...dragParams, drop: overSortableItem ? overSortableItem : dropItem });
      }
      this.resetData();
    }

    resetData = () => {
      // 拖拽元素
      const dragged = this.dragged;
      // 克隆拖拽元素
      const cloneDragged = this.cloneDragged;
      // 目标元素
      const over = this.over;
      const sortArea = this.sortArea;
      const options = this.getOptions(this.props.options);
      const sortSmallClass = options?.sortSmallClass || '';
      const sortBigClass = options?.sortBigClass || '';
      // 重置
      if (dragged) {
        dragged.draggable = undefined;
        cloneDragged.draggable = undefined;
        dragged.style.display = this.lastDisplay;
        cloneDragged?.parentNode?.removeChild?.(cloneDragged);
      }
      over?.classList?.remove(sortBigClass, sortSmallClass);
      this.cloneDragged = undefined;
      this.dragged = undefined;
      this.over = undefined;
      const ownerDocument = getOwnerDocument(sortArea);
      removeEvent(ownerDocument, 'dragover', this.onDragOver);
    }

    handleDragOverClass = (params: { draggedIndex: number, newOverIndex: number, oldOverIndex: number, newOver: HTMLElement, oldOver?: HTMLElement, props: DndBaseProps }) => {
      const { draggedIndex, newOverIndex, oldOverIndex, newOver, oldOver, props } = params;
      const { onHover, onUnHover } = props;
      const options = this.getOptions(props?.options);
      const sortSmallClass = options?.sortSmallClass || '';
      const sortBigClass = options?.sortBigClass || '';
      newOver.classList.remove(sortSmallClass, sortBigClass);
      if (draggedIndex < newOverIndex) {
        newOver.classList.add(sortSmallClass);
        onHover && onHover(newOver);
      } else {
        newOver.classList.add(sortBigClass);
        onHover && onHover(newOver);
      }
      if (oldOver && newOverIndex !== oldOverIndex) {
        oldOver.classList.remove(sortBigClass, sortSmallClass);
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
    onTouchStart: EventHandler = (e: any, data) => {
      e.stopPropagation();
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
            drag: {
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
      const options = this.getOptions(this.props?.options);
      if (options?.allowSort) {
        // 添加拖拽副本
        if (dragged?.style?.display !== "none" && !isContains(sortArea, cloneDragged)) {
          insertAfter(cloneDragged, dragged);
        }
        dragged.style.display = "none";
      }
      // 经过的节点
      const target = dndManager.findOver(e, cloneDragged);
      const dragItem = dndManager.getDragItem(dragged);
      // 触发目标
      if (dragItem && target) {
        const overSortableItem = dndManager.getDragItem(target);
        const dropItem = dndManager.getDropItem(target);
        // 拖放行为是否在同域内
        if (overSortableItem?.groupNode === sortArea || dropItem?.groupNode == sortArea || dragged.contains(target)) {
          if (overSortableItem) {
            this.sortInSameArea(overSortableItem?.item);
          } else {
            if (sortArea === dropItem?.groupNode && dropItem) {
              this.setDropEndChild(e, dropItem, cloneDragged);
            }
          }
        } else {
          // 插入新容器
          if (overSortableItem || dropItem) {
            const dropGroup = overSortableItem ? dndManager.getDropItem(overSortableItem?.groupNode) : dropItem;
            if (dropGroup) {
              if (!this.getOptions(dropGroup?.props?.options)?.allowDrop) {
                // 鼠标的样式更改
                if (e.dataTransfer) {
                  e.dataTransfer.dropEffect = DropEffect.None;
                }
                return;
              }
              this.addNewOver(e, dropGroup, overSortableItem);
            }
          }
        }
        const params = {
          e,
          drag: {
            ...dragItem,
            clone: cloneDragged
          },
          over: overSortableItem ? overSortableItem : dropItem
        };
        this.props.onMove && this.props.onMove(params);
      }
    }

    // 移动事件(移动端)
    onTouchMove: EventHandler = (e) => {
      // 阻止冒泡
      e.stopPropagation();
      this.moveHandle(e);
    }

    // 鼠标dragOver事件(鼠标端)
    onDragOver = (e: any) => {
      // over默认行为阻止
      e.preventDefault();
      // 阻止冒泡
      e.stopPropagation();
      this.moveHandle(e);
    }

    // 同区域内拖拽更新位置
    sortInSameArea = (newOver?: HTMLElement & { animated?: boolean }) => {
      const dragged = this.dragged;
      const cloneDragged = this.cloneDragged;
      const oldOver = this.over;
      const options = this.getOptions(this.props.options);
      // 只允许一个动画
      if (!newOver || newOver?.animated) return;
      // 更换之前的初始位置
      const newOverPreRect = newOver.getBoundingClientRect();
      const draggedPreRect = cloneDragged.getBoundingClientRect();
      // 位置序号
      const draggedIndex = getChildrenIndex(cloneDragged, [dragged]);
      const newOverIndex = getChildrenIndex(newOver, [dragged]);
      const oldOverIndex = getChildrenIndex(oldOver, [dragged]);
      if (draggedIndex < newOverIndex) {
        options?.allowSort && insertAfter(cloneDragged, newOver);
        this.over = newOver;
      } else {
        // 目标比元素小，插到其前面
        options?.allowSort && insertBefore(cloneDragged, newOver);
        this.over = newOver;
      }
      this.handleDragOverClass({ draggedIndex, newOverIndex, oldOverIndex, oldOver, newOver, props: this.props });
      // 添加动画
      _animate(cloneDragged, draggedPreRect);
      _animate(newOver, newOverPreRect);
    }

    // 跨域添加新元素
    addNewOver = (e: EventType, dropItem: DndSortable, sortableItem?: SortableItem) => {
      const dropGroupNode = dropItem?.groupNode;
      const cloneDragged = this.cloneDragged;
      const options = this.getOptions(dropItem.props.options);
      const oldOver = this.over;
      // 第一次往容器后面添加
      if (!dropGroupNode?.contains(cloneDragged) && options?.allowSort) {
        this.over = dropGroupNode;
        const draggedPreRect = cloneDragged.getBoundingClientRect();
        dropGroupNode?.appendChild(cloneDragged);
        _animate(cloneDragged, draggedPreRect);
      } else {
        const sortableOver = sortableItem?.item;
        // 如果有可排序的over目标则进行排序
        if (sortableOver) {
          // 只允许一个动画
          if (sortableOver?.animated) return;

          // 更换之前的初始位置
          const newOverPreRect = sortableOver.getBoundingClientRect();
          const draggedPreRect = cloneDragged.getBoundingClientRect();
          // 位置序号
          const draggedIndex = getChildrenIndex(cloneDragged);
          const newOverIndex = getChildrenIndex(sortableOver);
          const oldOverIndex = getChildrenIndex(oldOver);
          // 新元素插入之后
          if (draggedIndex < newOverIndex) {
            options?.allowSort && insertAfter(cloneDragged, sortableOver);
            this.over = sortableOver;
          } else {
            // 目标比元素小，插到其前面
            options?.allowSort && insertBefore(cloneDragged, sortableOver);
            this.over = sortableOver;
          }
          this.handleDragOverClass({ draggedIndex, newOverIndex, oldOverIndex, oldOver, newOver: sortableOver, props: dropItem?.props });
          // 添加动画
          _animate(cloneDragged, draggedPreRect);
          _animate(sortableOver, newOverPreRect);
        } else {
          this.setDropEndChild(e, dropItem, cloneDragged)
        }
      }
    }

    // 当在容器最后面时添加在最末尾
    setDropEndChild = (e: EventType, dropItem: DndSortable, cloneDragged: HTMLElement) => {
      const parent = dropItem?.groupNode;
      const props = dropItem.props;
      const options = this.getOptions(props.options);
      const near = dndManager.findNearest(e, parent);
      if (cloneDragged !== near && near === parent.lastChild) {
        if (options?.allowSort) {
          const draggedPreRect = cloneDragged.getBoundingClientRect();
          parent?.appendChild(cloneDragged);
          _animate(cloneDragged, draggedPreRect);
        }
        this.over && props.onUnHover && props.onUnHover(this.over);
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
          onMoveStart={ismobile ? this.onTouchStart : undefined}
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
