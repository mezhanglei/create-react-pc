import * as React from 'react';
import classNames from 'classnames';
import CSSMotion from 'rc-motion';
import "./Mask.less";

export default function Mask(props) {
    const {
        prefixCls = "ant-modal",
        style,
        visible,
        maskProps,
        motionName
    } = props;

    return (
        <CSSMotion
            key="mask"
            visible={visible}
            motionName={motionName}
            leavedClassName={`${prefixCls}-mask-hidden`}
        >
            {({ className: motionClassName, style: motionStyle }) => (
                <div
                    style={{ ...motionStyle, ...style }}
                    className={classNames(`${prefixCls}-mask`, motionClassName)}
                    {...maskProps}
                />
            )}
        </CSSMotion>
    );
}
