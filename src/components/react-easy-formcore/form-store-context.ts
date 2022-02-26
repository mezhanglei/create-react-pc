import React from 'react';

import { FormStore } from './form-store';

export const FormStoreContext = React.createContext<FormStore | undefined>(undefined)
export const FormValuesContext = React.createContext<Partial<unknown> | undefined>(undefined)
