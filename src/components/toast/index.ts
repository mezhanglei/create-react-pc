import RenderContainer from "./ToastsContainer";
import { ToastProps, ToastType } from "./type";

let container: any;

// 实例化容器
const getContainer = (props: ToastProps) => {
    // 保证只有一个容器
    if (!container) {
        container = RenderContainer(props);
    }
};

// 触发渲染toast的方法
const renderToast = (props: ToastProps) => {
    getContainer(props);
    container.show();
};

// toast
export default {
    success: (message: any, config?: ToastProps) => {
        renderToast({ ...config, status: ToastType.SUCCESS, message });
    },
    info: (message: any, config?: ToastProps) => {
        renderToast({ ...config, status: ToastType.INFO, message });
    },
    warning: (message: any, config?: ToastProps) => {
        renderToast({ ...config, status: ToastType.WARNING, message });
    },
    error: (message: any, config?: ToastProps) => {
        renderToast({ ...config, status: ToastType.ERROR, message });
    }
};
