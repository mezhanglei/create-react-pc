import React from 'react';
import { DndContext } from './dnd-context';
import { DndContextProviderProps } from './utils/types';

// dnd的provider，提供拖拽相关的api
export default function DndContextProvider(props: DndContextProviderProps) {
  const { children, ...options } = props;

  return (
    <DndContext.Provider value={options}>
      {children}
    </DndContext.Provider>
  );
};
