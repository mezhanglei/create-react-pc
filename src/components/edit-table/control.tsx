import classnames from 'classnames'
import React, { CSSProperties, useContext, useEffect } from 'react'
import './control.less'
import { getCellPath } from './use-edit-table'
import Validator, { FormRule } from '../react-easy-formcore/validator'
import { TableControlContext } from './edit-table'

// 编辑所传的参数
export interface ControlEditable {
  validator?: Validator
  key?: string
  dataIndex?: string
}
export interface ControlProps extends ControlEditable {
  children: any
  style?: CSSProperties
  className?: string
  rules?: FormRule[]
  compact?: boolean
  suffix?: React.ReactNode | any // 右边节点
  footer?: React.ReactNode | any // 底部节点
}

export const Control = React.forwardRef((props: ControlProps, ref: any) => {
  const {
    children,
    style,
    className,
    compact,
    footer,
    suffix,
    rules,
    ...restProps
  } = props

  const { validator, key, dataIndex } = useContext(TableControlContext)

  useEffect(() => {
    return () => {
      addRules?.(key, dataIndex)
    }
  }, [])

  // 添加校验规则
  const addRules = (rowKey?: string, dataIndex?: string, rules?: FormRule[]) => {
    const path = getCellPath(rowKey, dataIndex)
    if (!path || !validator) return
    validator?.add?.(path, rules)
  }

  addRules?.(key, dataIndex, rules)

  const path = getCellPath(key, dataIndex)
  const error = validator?.getError(path)

  const prefix = 'item-control'

  const cls = classnames(
    `${prefix}__container`,
    error ? `${prefix}--error` : '',
    compact ? `${prefix}--compact` : '',
    className ? className : ''
  )

  return (
    <div ref={ref} className={cls} style={style}>
      <div className={`${prefix}__content`}>
        {children}
        {footer !== undefined && <div className={`${prefix}__footer`}>{footer}</div>}
        <div className={`${prefix}__message`}>{error}</div>
      </div>
      {suffix !== undefined && <div className={`${prefix}__suffix`}>{suffix}</div>}
    </div>
  )
})

Control.displayName = 'Control'
