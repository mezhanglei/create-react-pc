import Modal, { destroyFns, ModalFuncProps } from './Modal';
import confirm from './confirmModal';

Modal.info = (props: ModalFuncProps) => {
    const config = {
        type: 'info',
        ...props
    };
    return confirm(config);
};

Modal.success = (props: ModalFuncProps) => {
    const config = {
        type: 'success',
        ...props
    };
    return confirm(config);
};

Modal.error = (props: ModalFuncProps) => {
    const config = {
        type: 'error',
        ...props
    };
    return confirm(config);
};

Modal.confirm = (props: ModalFuncProps) => {
    const config = {
        type: 'confirm',
        ...props
    };
    return confirm(config);
};

// 关闭所有的confirmDialog
Modal.destroyAll = () => {
    while (destroyFns.length) {
        const close = destroyFns.pop();
        if (close) {
            close();
        }
    }
};

export default Modal;
