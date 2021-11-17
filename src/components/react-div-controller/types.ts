import { CSSProperties } from "react";

export type EventType = MouseEvent | TouchEvent;

export interface DrawItemProps {
    children: any
    className?: string
    style?: CSSProperties
    forwardedRef?: any
}