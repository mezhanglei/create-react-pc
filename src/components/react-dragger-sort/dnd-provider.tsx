import React from 'react';
import { DndProviderContext } from './dnd-context';
import { DndProviderProps } from './utils/types';
import { DndStore } from './dnd-store';

// 创建DndContextProvider实例
export default function BuildDndProvider(props?: DndStore) {
  const store = props || new DndStore();
  function DndContextProvider(props: DndProviderProps) {
    const {
      children,
      ...options
    } = props;

    return (
      <DndProviderContext.Provider value={{ ...options, store }}>
        {children}
      </DndProviderContext.Provider>
    );
  };
  return DndContextProvider;
};

