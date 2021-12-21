import { useMemo } from 'react'

import { FormStore } from './form-store'

export function useFormStore<T extends Object = any> (
  values: Partial<T> = {}
) {
  return useMemo(() => new FormStore(values), [])
}
