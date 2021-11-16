import React, { useCallback, useRef, useState } from 'react';
import "./index.less"

// 东南西北， 东北、西北、东南、西南
const points = ['e', 'w', 's', 'n', 'ne', 'nw', 'se', 'sw']

function Drawing() {

    const wrapStyle = {
        left: 100,
        top: 100,
        width: 500,
        height: 500
    }
    const [style, setStyle] = useState({
        left: 100,
        top: 100,
        width: 100,
        height: 100
    })
    // 初始数据， 因为不需要重新render 所以用 useRef
    const oriPos = useRef({
        top: 0, // 元素的坐标
        left: 0,
        cX: 0, // 鼠标的坐标
        cY: 0
    })
    const isDown = useRef(false)

    // 鼠标被抬起
    function onMouseUp(e) {
        console.log(e, 'onMouseUp');
        isDown.current = false;
    }

    function transform(direction, oriPos, e) {
        const style = { ...oriPos.current }
        const offsetX = e.clientX - oriPos.current.cX;
        const offsetY = e.clientY - oriPos.current.cY;
        switch (direction.current) {
            // 拖拽移动
            case 'move':
                // 元素当前位置 + 偏移量
                const top = oriPos.current.top + offsetY;
                const left = oriPos.current.left + offsetX;
                // 限制必须在这个范围内移动 画板的高度-元素的高度
                style.top = Math.max(0, Math.min(top, wrapStyle.height - style.height));
                style.left = Math.max(0, Math.min(left, wrapStyle.width - style.width));
                break
            // 东
            case 'e':
                // 向右拖拽添加宽度
                style.width += offsetX;
                return style
            // 西
            case 'w':
                // 增加宽度、位置同步左移
                style.width -= offsetX;
                style.left += offsetX;
                return style
            // 南
            case 's':
                style.height += offsetY;
                return style
            // 北
            case 'n':
                style.height -= offsetY;
                style.top += offsetY;
                break
            // 东北
            case 'ne':
                style.height -= offsetY;
                style.top += offsetY;
                style.width += offsetX;
                break
            // 西北
            case 'nw':
                style.height -= offsetY;
                style.top += offsetY;
                style.width -= offsetX;
                style.left += offsetX;
                break
            // 东南
            case 'se':
                style.height += offsetY;
                style.width += offsetX;
                break
            // 西南
            case 'sw':
                style.height += offsetY;
                style.width -= offsetX;
                style.left += offsetX;
                break
            // 拖拽移动
            case 'rotate':
                // 先计算下元素的中心点, x，y 作为坐标原点
                const x = style.width / 2 + style.left;
                const y = style.height / 2 + style.top;
                // 当前的鼠标坐标
                const x1 = e.clientX;
                const y1 = e.clientY;
                // 运用高中的三角函数
                style.transform = `rotate(${(Math.atan2((y1 - y), (x1 - x))) * (180 / Math.PI) - 90}deg)`;
                break
        }
        return style
    }
    // 鼠标被按下
    const onMouseDown = useCallback((dir, e) => {
        // 阻止事件冒泡
        e.stopPropagation();
        // 保存方向。
        direction.current = dir;
        isDown.current = true;
        // 然后鼠标坐标是
        const cY = e.clientY; // clientX 相对于可视化区域
        const cX = e.clientX;
        oriPos.current = {
            ...style,
            cX, cY
        }
    })

    // 鼠标移动
    const onMouseMove = useCallback((e) => {
        // 判断鼠标是否按住
        if (!isDown.current) return
        let newStyle = transform(direction, oriPos, e);
        setStyle(newStyle)
    }, [])

    return (
        <div className="drawing-wrap" onMouseUp={onMouseUp} onMouseMove={onMouseMove}>
            <div className="drawing-item" style={style}>
                {points.map(item => <div className={`control-point point-${item}`}></div>)}
                <div className="control-point control-rotator" onMouseDown={onMouseDown.bind(this, 'rotate')}></div>
            </div>
        </div>
    )
}
export default Drawing;