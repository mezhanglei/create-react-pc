import React from 'react'

export interface FormOptions {
  inline?: boolean
  compact?: boolean
  required?: boolean
  labelWidth?: number
  labelAlign?: 'left' | 'right'
  gutter?: number
  errorClassName?: string
  onFormChange?: (obj: {name: string, value: any}) => void
}

export const FormOptionsContext = React.createContext<FormOptions>({})
