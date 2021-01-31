import React, { useEffect, useRef } from "react";

// 提供ref引用
export const usePrevious = <T>(value?: T): any => {
    const ref = useRef<T>();
    useEffect(() => {
        ref.current = value;
    }, [value]);
    return ref.current;
};
