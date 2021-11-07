import { useMemo } from 'react'

import { FormRules, FormStore } from './form-store'

export function useFormStore<T extends Object = any> (
  values: Partial<T> = {},
  formRules?: FormRules<T>
) {
  return useMemo(() => new FormStore(values, formRules), [])
}
