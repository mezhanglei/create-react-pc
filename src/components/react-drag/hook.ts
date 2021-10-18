import { RefObject, useContext, useEffect, useRef } from "react"
import { DragAndDropContext } from "./DragAndDrop"

export interface UseDragProps {
  collection?: unknown;
  onDragStart?: (collection?: unknown) => void;
}
export function useDrag(props: UseDragProps) {

  const { DragAndDropManager } = useContext(DragAndDropContext)
  let dragRef = useRef()

  const handleDragStart = (e) => {
    DragAndDropManager.setActive(props.collection)
    if (e.dataTransfer !== undefined) {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.dropEffect = "move";
      e.dataTransfer.setData("text/plain", "drag") // firefox fix
    }
    if (props.onDragStart) {
      props.onDragStart(DragAndDropManager.active)
    }
  }

  useEffect(() => {
    const current = dragRef.current;
    if (current) {
      current.setAttribute("draggable", true)
      current.addEventListener("dragstart", handleDragStart)
    }
    return () => {
      current.removeEventListener("dragstart", handleDragStart)
    }
  }, [dragRef.current])

  // 更新ref
  const setDragRef = (ref: RefObject<HTMLDivElement>) => {
    dragRef = ref;
    return ref;
  }

  return [dragRef, setDragRef]
}

export interface UseDropProps {
  onDragOver?: (e: MouseEvent, collection: unknown, showAfter: boolean) => void;
  onDrop?: (collection: unknown) => void;
  onDragLeave?: (collection: unknown) => void;
}
export function useDrop(props: UseDropProps) {
  // 获取最外层store里的数据
  const { DragAndDropManager } = useContext(DragAndDropContext)
  let dropRef = useRef(null);

  const handleDragOver = (e) => {
    // e就是拖拽的event对象
    e.preventDefault()
    // getBoundingClientRect的图请看下面
    const overElementHeight = e.currentTarget.getBoundingClientRect().height / 2
    const overElementTopOffset = e.currentTarget.getBoundingClientRect().top
    // clientY就是鼠标到浏览器页面可视区域的最顶端的距离
    const mousePositionY = e.clientY
    // mousePositionY - overElementTopOffset就是鼠标在元素内部到元素border-top的距离
    const showAfter = mousePositionY - overElementTopOffset > overElementHeight
    if (props.onDragOver) {
      props.onDragOver(e, DragAndDropManager.active, showAfter)
    }
  }
  // drop事件
  const handledDrop = (e: React.DragEvent) => {
    e.preventDefault()

    if (props.onDrop) {
      props.onDrop(DragAndDropManager.active)
    }
  }
  // dragLeave事件
  const handledragLeave = (e: React.DragEvent) => {
    e.preventDefault()

    if (props.onDragLeave) {
      props.onDragLeave(DragAndDropManager.active)
    }
  }

  // 注册事件，注意销毁组件时要注销事件，避免内存泄露
  useEffect(() => {
    const current = dropRef.current;
    if (current) {
      current.addEventListener("dragover", handleDragOver)
      current.addEventListener("drop", handledDrop)
      current.addEventListener("dragleave", handledragLeave)
    }
    return () => {
      current.removeEventListener("dragover", handleDragOver)
      current.removeEventListener("drop", handledDrop)
      current.removeEventListener("dragleave", handledragLeave)
    }
  }, [dropRef.current])

  // 更新ref
  const setDropRef = (ref: RefObject<HTMLDivElement>) => {
    dropRef = ref;
    return ref;
  }

  return [dropRef, setDropRef]
}
