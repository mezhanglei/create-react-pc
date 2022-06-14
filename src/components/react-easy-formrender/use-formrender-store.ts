import { useMemo } from 'react'

import { FormRenderStore } from './formrender-store'

export function useFormRenderStore<T extends Object = any> (
  values?: Partial<T>
) {
  return useMemo(() => new FormRenderStore(values), [])
}
