import React from 'react'

export interface FormOptions {
  inline?: boolean
  compact?: boolean
  required?: boolean
  labelWidth?: number
  labelAlign?: 'left' | 'right'
  gutter?: number
  errorClassName?: string
  onValuesChange?: (obj: {value: any, values: any, error: string[]}) => void
}

export const FormOptionsContext = React.createContext<FormOptions>({})
