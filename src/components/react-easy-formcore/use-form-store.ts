import { useMemo } from 'react'

import { FormStore } from './form-store'
import Validator from './validator'

export function useFormStore<T extends Object = any> (
  values?: Partial<T>
) {
  return useMemo(() => new FormStore(values), [])
}

export function useValidator () {
  return useMemo(() => new Validator(), [])
}
