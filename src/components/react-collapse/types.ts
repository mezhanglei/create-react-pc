import { CSSProperties } from "react";

export interface CollapseProps {
    initialStyle?: CSSProperties
    isOpened?: boolean
    theme: { collapse: string, content: string }
    checkTimeout: number
    children: any
    onRest?: (props: {isFullyOpened: boolean, isFullyClosed: boolean, isOpened: boolean, containerHeight: number, contentHeight: number}) => void
    onWork?: (props: {isFullyOpened: boolean, isFullyClosed: boolean, isOpened: boolean, containerHeight: number, contentHeight: number}) => void
}

export interface UnmountCollapseState {
    isResting?: boolean // 是否调整结束
    isOpened?: boolean // 控制打开或关闭
    isInitialRender?: boolean // 是不是初始化操作
}