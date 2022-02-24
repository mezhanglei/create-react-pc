import React from 'react';
import { DesignStore } from './design-store';

export const StoreContext = React.createContext<DesignStore | undefined>(undefined)
export const Ctx = React.createContext(() => {});
