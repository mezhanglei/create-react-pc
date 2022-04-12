import React, { CSSProperties } from 'react';
import { DragDirectionCode, DraggableEvent, EventHandler } from "@/components/react-free-draggable";
import { DndProps, DndSortable, SortableItem } from "./utils/types";
import classNames from "classnames";
import { css, addEvent, getChildrenIndex, insertAfter, insertBefore, removeEvent, isContains, getOwnerDocument, matches } from "@/utils/dom";
import { DndManager } from './dnd-manager';
import { _animate } from './utils/dom';

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
      const document = getOwnerDocument(this.sortArea);
      removeEvent(document, 'dragover', this.onDragOverHandle);
    }

    componentDidUpdate(prevProps: DndProps) {
      const optionsChanged = this.props.options !== undefined && this.props.options !== prevProps.options;
      if (optionsChanged) {
        this.initManagerData();
      }
    }

    static getDerivedStateFromProps(nextProps: DndProps, prevState: any) {
      const optionsChanged = nextProps.options !== prevState.prevOptions;
      if (optionsChanged) {
        return {
          ...prevState,
          prevWidth: nextProps.options,
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
      const { children, className, style, ...restProps } = this.props;
      const options = this.getOptions(restProps?.options);
      const childNodes = this.sortArea?.children;
      const childDrag = options?.childDrag instanceof Array ? options?.childDrag : [];
      const parentPath = options?.groupPath;
      // 初始化可拖拽元素
      children?.map((child: any, index: number) => {
        const childNode = childNodes[index];
        const path = parentPath !== undefined ? `${parentPath}.${index}` : `${index}`;
        dndManager.setDragItemsMap({
          groupName: options.group,
          groupNode: this.sortArea,
          props: restProps,
          item: childNode,
          index,
          path: path,
          groupPath: parentPath,
          draggableIndex: getChildrenIndex(childNode, undefined, childDrag)
        });
      });
      // 初始化可拖放元素
      dndManager.setDropItemsMap({
        groupName: options.group,
        groupNode: this.sortArea,
        groupPath: parentPath,
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

    onStartHandle: EventHandler = (e: any) => {
      e.stopPropagation();
      const currentTarget = e.currentTarget;
      if (currentTarget && this.isCanDrag(currentTarget, this.props?.options)) {
        currentTarget.draggable = true;
        this.lastDisplay = css(currentTarget)?.display;
      }
    }

    onEndHandle: EventHandler = (e: any) => {
      e.stopPropagation();
      const dragged = this.dragged;
      if (dragged) {
        dragged.draggable = false;
      }
    }

    onDragStartHandle = (e: any) => {
      e.stopPropagation();
      const currentTarget = e.currentTarget;
      if (currentTarget) {
        const cloneDragged = currentTarget.cloneNode(true);
        this.dragged = currentTarget;
        this.cloneDragged = cloneDragged;
        // dataTransfer.setData把拖动对象的数据存入其中，可以用dataTransfer.getData来获取数据
        e.dataTransfer.setData("data", e.target.innerText);
        const document = getOwnerDocument(this.sortArea);
        addEvent(document, 'dragover', this.onDragOverHandle);
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

    onDragEndHandle = (e: any) => {
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
      const dropIndex = getChildrenIndex(cloneDragged, [dragged]); // drop目标的位置index
      if (dragItem) {
        const dragParams = {
          e,
          drag: {
            ...dragItem,
            clone: cloneDragged
          }
        };
        // 是否为同域排序
        if (overSortableItem && overSortableItem?.groupNode === sortArea) {
          this.props.onUpdate && this.props.onUpdate({ ...dragParams, drop: { ...overSortableItem, dropIndex } });
        } else {
          // 跨域排序
          if (dropItem || overSortableItem) {
            const dropArea = overSortableItem ? dndManager.getDropItem(overSortableItem?.groupNode) : dropItem;
            if (dropArea) {
              dropArea?.props?.onAdd && dropArea.props?.onAdd({
                ...dragParams,
                drop: { ...dropArea, ...overSortableItem, dropIndex }
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
      dragged.draggable = undefined;
      cloneDragged.draggable = undefined;

      over?.classList?.remove(sortBigClass, sortSmallClass);
      dragged.style.display = this.lastDisplay;
      cloneDragged?.parentNode?.removeChild?.(cloneDragged);
      this.cloneDragged = undefined;
      this.dragged = undefined;
      this.over = undefined;
      const document = getOwnerDocument(sortArea);
      removeEvent(document, 'dragover', this.onDragOverHandle);
    }

    handleDragOverClass = (params: { draggedIndex: number, newOverIndex: number, oldOverIndex: number, newOver: HTMLElement, oldOver?: HTMLElement, options: DndProps['options'] }) => {
      const { draggedIndex, newOverIndex, oldOverIndex, newOver, oldOver, options } = params;
      const sortSmallClass = options?.sortSmallClass || '';
      const sortBigClass = options?.sortBigClass || '';
      newOver.classList.remove(sortSmallClass, sortBigClass);
      if (draggedIndex < newOverIndex) {
        newOver.classList.add(sortSmallClass);
      } else {
        newOver.classList.add(sortBigClass);
      }
      if (oldOver && newOverIndex !== oldOverIndex) {
        oldOver.classList.remove(sortBigClass, sortSmallClass);
      }
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
      this.handleDragOverClass({ draggedIndex, newOverIndex, oldOverIndex, oldOver, newOver, options });
      // 添加动画
      _animate(cloneDragged, draggedPreRect);
      _animate(newOver, newOverPreRect);
    }

    // 跨域在指定位置插入新元素
    insertNewOver = (dropItem: DndSortable, sortableItem: SortableItem) => {
      const dropArea = dropItem?.groupNode;
      const cloneDragged = this.cloneDragged;
      const oldOver = this.over;
      if (sortableItem) {
        const newOver = sortableItem?.item;
        const options = this.getOptions(dropItem?.props?.options);
        // 只允许一个动画
        if (newOver?.animated) return;

        // 更换之前的初始位置
        const newOverPreRect = newOver.getBoundingClientRect();
        const draggedPreRect = cloneDragged.getBoundingClientRect();

        // 新元素插入之前
        if (!dropArea?.contains(cloneDragged)) {
          options?.allowSort && insertBefore(cloneDragged, newOver);
          this.over = newOver;
        } else {
          // 位置序号
          const draggedIndex = getChildrenIndex(cloneDragged);
          const newOverIndex = getChildrenIndex(newOver);
          const oldOverIndex = getChildrenIndex(oldOver);
          // 新元素插入之后
          if (draggedIndex < newOverIndex) {
            options?.allowSort && insertAfter(cloneDragged, newOver);
            this.over = newOver;
          } else {
            // 目标比元素小，插到其前面
            options?.allowSort && insertBefore(cloneDragged, newOver);
            this.over = newOver;
          }
          this.handleDragOverClass({ draggedIndex, newOverIndex, oldOverIndex, oldOver, newOver, options });
        }
        // 添加动画
        _animate(cloneDragged, draggedPreRect);
        _animate(newOver, newOverPreRect);
      }
    }

    // 跨域添加新元素
    appendNewOver = (dropItem: DndSortable) => {
      const dropArea = dropItem?.groupNode;
      const cloneDragged = this.cloneDragged;
      const options = this.getOptions(dropItem.props.options);
      if (!dropArea?.contains(cloneDragged)) {
        this.over = dropArea;
        const draggedPreRect = cloneDragged.getBoundingClientRect();
        options?.allowSort && dropArea?.appendChild(cloneDragged);
        _animate(cloneDragged, draggedPreRect);
      }
    }

    onDragOverHandle = (e: any) => {
      // over默认行为阻止
      e.preventDefault();
      // 阻止冒泡
      e.stopPropagation();
      const dragged = this.dragged;
      const cloneDragged = this.cloneDragged;
      const sortArea = this.sortArea;
      // 添加拖拽副本
      if (dragged?.style?.display !== "none" && !isContains(sortArea, cloneDragged)) {
        insertAfter(cloneDragged, dragged);
      }
      dragged.style.display = "none";
      // 触发事件的目标
      const target = e.target;

      const dragItem = dndManager.getDragItem(dragged);
      // 触发目标排除拖拽的直接父元素，拖拽元素，拖拽元素的子元素
      if (dragItem && target !== sortArea && !dragged.contains(target)) {

        const overSortableItem = dndManager.getDragItem(target);
        const dropItem = dndManager.getDropItem(target);
        // 是否为同域排序
        if (overSortableItem?.groupNode === sortArea) {
          this.sortInSameArea(overSortableItem?.item);
        } else {
          // 插入容器指定位置
          if (overSortableItem) {
            const dropArea = dndManager.getDropItem(overSortableItem?.groupNode);
            if (dropArea && this.getOptions(dropArea?.props?.options)?.allowDrop) {
              this.insertNewOver(dropArea, overSortableItem);
            }
            // 插入容器的最后面
          } else if (dropItem && this.getOptions(dropItem?.props?.options)?.allowDrop) {
            this.appendNewOver(dropItem);
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

    renderChild(child: any) {
      const options = this.getOptions(this.props?.options);

      return (
        <DraggableEvent
          handle={options?.handle}
          filter={options?.filter}
          onStart={this.onStartHandle}
          onEnd={this.onEndHandle}
          direction={options?.direction}
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
      );
    }
  };
};
