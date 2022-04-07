import React, { useEffect, useState, useRef, useImperativeHandle } from 'react';
import DragGrid, { GridItemEvent, DragGridProps, DragGridHandler } from '@/components/react-draggable-layout';

export interface DragGridRef {
    go: () => void;
    back: () => void;
    clear: () => void;
}
// 存在历史记录的grid
export const HistoryLayout = React.forwardRef<DragGridRef, DragGridProps>((props, ref) => {
    const dragRef = useRef<any>();
    const [layout, setLayout] = useState<GridItemEvent[]>([]);
    const lastLayoutItemRef = useRef<GridItemEvent>();
    const activeIndexRef = useRef<number>();
    const cacheLayoutArrRef = useRef<string[]>([]);

    useImperativeHandle(ref, () => ({
        go,
        back,
        clear
    }));

    useEffect(() => {
        setLayout(props?.layout);
        const cache = getCacheLayout(props?.layout);
        if (cache) {
            cacheLayoutArrRef.current?.push(cache);
            activeIndexRef.current = cacheLayoutArrRef.current?.length - 1;
        }
    }, [props?.layout])

    const getCacheLayout = (layout: GridItemEvent[]) => {
        return layout && JSON.stringify({ layout: layout });
    }

    const cacheToLayout = (cache: string) => {
        try {
            if (cache) {
                const { layout } = JSON.parse(cache);
                setLayout(layout)
            };
        } catch (e) {
        }
    }

    const back = () => {
        const cacheArr = cacheLayoutArrRef.current;
        if (cacheArr?.length > 1) {
            const lastIndex = activeIndexRef.current || 0;
            const index = Math.max(0, lastIndex - 1);
            activeIndexRef.current = index;
            const active = cacheArr?.[index];
            active && cacheToLayout(active);
        }
    }

    const go = () => {
        const cacheArr = cacheLayoutArrRef.current;
        if (cacheArr?.length > 1) {
            const lastIndex = activeIndexRef.current || 0;
            const index = Math.min(lastIndex + 1, cacheArr?.length - 1);
            activeIndexRef.current = index;
            const active = cacheArr?.[index];
            active && cacheToLayout(active);
        }
    }

    const clear = () => {
        const cacheArr = cacheLayoutArrRef.current?.slice(0, 1);
        cacheLayoutArrRef.current = cacheArr;
        if (cacheArr?.length) {
            const index = cacheArr?.length - 1;
            activeIndexRef.current = index;
            const active = cacheArr?.[index];
            active && cacheToLayout(active);
        }
    }

    const onStart: DragGridHandler = (layoutItem, oldLayout, newLayout) => {
        lastLayoutItemRef.current = layoutItem;
        props.onStart && props.onStart(layoutItem, oldLayout, newLayout)
    }

    const onEnd: DragGridHandler = (layoutItem, oldLayout, newLayout) => {
        const { GridY, GridX, h, w } = lastLayoutItemRef.current || {};
        if (GridX === layoutItem.GridX && GridY === layoutItem.GridY && h === layoutItem.h && w === layoutItem.w) {
            return;
        }
        // 缓存截取
        const index = activeIndexRef.current;
        if (index !== undefined && index < cacheLayoutArrRef.current?.length - 1) {
            cacheLayoutArrRef.current = cacheLayoutArrRef.current?.slice?.(0, index + 1);
        }
        // 添加缓存
        const cache = newLayout && getCacheLayout(newLayout);
        if (cache) {
            cacheLayoutArrRef.current?.push(cache);
            activeIndexRef.current = cacheLayoutArrRef.current?.length - 1;
        }
        props.onEnd && props.onEnd(layoutItem, oldLayout, newLayout);
    }

    return <DragGrid ref={dragRef} {...props} layout={layout || []} onStart={onStart} onResizeEnd={onEnd} onEnd={onEnd} />
})