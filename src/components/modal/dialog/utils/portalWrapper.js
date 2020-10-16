import * as React from 'react';
import { canUseDom } from '@/utils/dom';

// 计算打开弹窗个数
let openCount = 0;
const supportDom = canUseDom();

// 根据传值解析出父元素
const getParent = (getContainer) => {
    if (!supportDom) {
        return null;
    }
    if (getContainer) {
        if (typeof getContainer === 'string') {
            return document.querySelectorAll(getContainer)[0];
        }
        if (typeof getContainer === 'function') {
            return getContainer();
        }
        if (
            typeof getContainer === 'object' &&
            getContainer instanceof window.HTMLElement
        ) {
            return getContainer;
        }
    }
    return document.body;
};

class PortalWrapper extends React.Component {

    constructor(props) {
        super(props);
        const { visible, getContainer } = props;
        // 计算打开的弹窗个数
        if (supportDom && getParent(getContainer) === document.body) {
            openCount = visible ? openCount + 1 : openCount;
        }
        this.state = {
            _self: this,
        };
    }

    componentDidUpdate() {
        this.setWrapperClassName();
    }

    componentWillUnmount() {
        const { visible, getContainer } = this.props;
        // 计算个数
        if (supportDom && getParent(getContainer) === document.body) {
            openCount = visible && openCount ? openCount - 1 : openCount;
        }
        // 移除节点
        this.removeCurrentContainer();
    }

    // 切换弹窗则计算次数或者更换节点则移除节点
    static getDerivedStateFromProps(props, { prevProps, _self }) {
        const { visible, getContainer } = props;
        if (prevProps) {
            if (
                visible !== prevProps.visible &&
                supportDom &&
                getParent(getContainer) === document.body
            ) {
                openCount = visible && !prevProps.visible ? openCount + 1 : openCount - 1;
            }
            const getContainerIsFunc =
                typeof getContainer === 'function' &&
                typeof prevProps.getContainer === 'function';
            if (
                getContainerIsFunc
                    ? getContainer.toString() !== prevProps.getContainer.toString()
                    : getContainer !== prevProps.getContainer
            ) {
                _self.removeCurrentContainer();
            }
        }
        return {
            prevProps: props,
        };
    }

    // 添加一个节点
    appendContainer = () => {
        if (!supportDom) {
            return null;
        }
        const parent = getParent(this.props.getContainer);
        if (!this.container && parent) {
            this.container = document.createElement('div');
            parent.appendChild(this.container);
        }
        this.setWrapperClassName();
        return this.container;
    }

    setWrapperClassName = () => {
        const { wrapperClassName } = this.props;
        if (
            this.container &&
            wrapperClassName &&
            wrapperClassName !== this.container.className
        ) {
            this.container.className = wrapperClassName;
        }
    };

    // 移除
    removeCurrentContainer = () => {
        this.container?.parentNode?.removeChild(this.container);
    };

    render() {
        const { children, visible } = this.props;
        const root = this.appendContainer();
        const childProps = {
            getOpenCount: () => openCount,
            appendContainer: this.appendContainer
        };

        if (visible && root) {
            return ReactDOM.createPortal(children(childProps), root);
        }
        return null;
    }
}

export default PortalWrapper;
