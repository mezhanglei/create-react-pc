import * as React from 'react';
import Modal, { destroyFns } from './Modal';
import confirm from './confirmModal.js';

Modal.info = (props) => {
    const config = {
        type: 'info',
        // icon: ,
        okCancel: false,
        ...props
    };
    return confirm(config);
};

Modal.success = (props) => {
    const config = {
        type: 'success',
        // icon: ,
        okCancel: false,
        ...props
    };
    return confirm(config);
};

Modal.error = (props) => {
    const config = {
        type: 'error',
        // icon: ,
        okCancel: false,
        ...props
    };
    return confirm(config);
};

Modal.confirm = (props) => {
    const config = {
        type: 'confirm',
        // icon: ,
        okCancel: true,
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
