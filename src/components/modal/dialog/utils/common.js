let uuid = -1;
export function getUUID() {
    uuid += 1;
    return uuid;
}

export function getMotionName(prefixCls, transitionName, animationName) {
    let motionName = transitionName;
    if (!motionName && animationName) {
        motionName = `${prefixCls}-${animationName}`;
    }
    return motionName;
}
