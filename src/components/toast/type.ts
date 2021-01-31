
// 类型
export enum ToastType {
    SUCCESS = "success",
    INFO = "info",
    WARNING = "warning",
    ERROR = "error"
}

// 操作toast容器的方法
export interface ContainerInterface {
    AddToast: (...rest: any[]) => void;
    clear: () => void;
    clearTime: () => void;
}

// toast的位置
export enum ToastsPosition {
    BOTTOM_CENTER = "bottom_center",
    BOTTOM_LEFT = "bottom_left",
    BOTTOM_RIGHT = "bottom_right",
    TOP_CENTER = "top_center",
    MIDDLE_CENTER = "middle_center",
    TOP_LEFT = "top_left",
    TOP_RIGHT = "top_right"
};

// props
export interface ToastProps {
    type: string;
    message: any;
    timer?: number;
    className?: string;
    id?: string | number;
    prefixCls?: string;
    position?: ToastsPosition;
    lightBackground?: boolean;
    maxLength?: number;
}
