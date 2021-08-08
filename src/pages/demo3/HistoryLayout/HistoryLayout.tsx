import React, { useEffect, useState, useRef, useImperativeHandle } from 'react';
import { DragactProps, DragactLayoutItem, DragGridHandler } from '@/components/react-draggable-layout/dragact-type';
import { Dragact } from '@/components/react-draggable-layout';

// 存在历史记录的grid
export const HistoryLayout = React.forwardRef<{}, DragactProps>((props, ref) => {
    const dragRef = useRef<any>();
    const [layout, setLayout] = useState<DragactLayoutItem[]>([]);
    const lastLayoutItemRef = useRef<DragactLayoutItem>();
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

    const getCacheLayout = (layout: DragactLayoutItem[]) => {
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

    const onDragStart: DragGridHandler = (layoutItem, oldLayout, newLayout) => {
        lastLayoutItemRef.current = layoutItem;
        props.onDragStart && props.onDragStart(layoutItem, oldLayout, newLayout)
    }

    const onDragEnd: DragGridHandler = (layoutItem, oldLayout, newLayout) => {
        const { GridY, GridX, h, w } = lastLayoutItemRef.current || {};
        if (GridX === layoutItem.GridX && GridY === layoutItem.GridY && h === layoutItem.h && w === layoutItem.w) {
            return;
        }
        // 重置缓存
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
        props.onDragEnd && props.onDragEnd(layoutItem, oldLayout, newLayout);
    }

    return <Dragact ref={dragRef} {...props} layout={layout || []} onDragStart={onDragStart} onDragEnd={onDragEnd} />
})