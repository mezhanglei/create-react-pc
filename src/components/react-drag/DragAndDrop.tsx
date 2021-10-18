import React from 'react';
import DragAndDropManager from './DragAndDropManager';

export const DragAndDropContext = React.createContext({ DragAndDropManager: {} });

// 给所有的使用useDrag和useDrop的组件传递消息
export interface DragAndDropProps {
  children: React.ReactNode
}

export const DragAndDrop:React.FC<DragAndDropProps> = ({ children }) => (
  <DragAndDropContext.Provider value={{ DragAndDropManager: new DragAndDropManager() }}>
    {children}
  </DragAndDropContext.Provider>
);