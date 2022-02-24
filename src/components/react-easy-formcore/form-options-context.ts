import React from 'react'

export interface FormFunc {
  onFieldsChange?: (obj: { name: string, value: any }) => void
  onValuesChange?: (obj: { name?: string, value: any }) => void
}

export interface FormOptions extends FormFunc {
  inline?: boolean
  compact?: boolean
  required?: boolean
  labelWidth?: number
  labelAlign?: 'left' | 'right'
  gutter?: number
}

export const FormOptionsContext = React.createContext<FormOptions>({})
