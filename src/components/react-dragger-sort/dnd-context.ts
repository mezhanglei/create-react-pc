import React from 'react';
import { DndProviderContextProps } from './utils/types';
import { DndAreaContextProps } from './utils/types';

export const DndAreaContext = React.createContext<DndAreaContextProps>({});
export const DndProviderContext = React.createContext<DndProviderContextProps>({})
