import React from 'react'

export interface FormOptions {
  inline?: boolean
  compact?: boolean
  required?: boolean
  labelWidth?: number
  labelAlign?: 'left' | 'right'
  gutter?: number
  errorClassName?: string
  onFieldsChange?: (obj: { name: string, value: any }) => void
  onValuesChange?: (obj: { name?: string, value: any }) => void
  onVisible?: (obj: { name?: string, hidden: boolean }) => void
}

export const FormOptionsContext = React.createContext<FormOptions>({})
