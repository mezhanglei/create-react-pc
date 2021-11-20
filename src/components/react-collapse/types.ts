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
    isResting?: boolean
    isOpened?: boolean
    isInitialRender?: boolean
}