import * as React from 'react';
import Dialog from './Dialog';
import PortalWrapper from './utils/portalWrapper';

// 渲染容器，将子元素插入到指定节点
export default (props) => {
    const { visible, getContainer } = props;

    // 值为false时表示在当前组件里渲染
    if (getContainer === false) {
        return (
            <Dialog
                {...props}
                getOpenCount={() => 2} // 不对 body 做任何操作。。
            />
        );
    }

    return (
        <PortalWrapper
            visible={visible}
            getContainer={getContainer}
        >
            {(childProps) => (
                <Dialog
                    {...props}
                    {...childProps}
                />
            )}
        </PortalWrapper>
    );
};
