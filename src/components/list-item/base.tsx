import React, { CSSProperties } from 'react'
import classnames from 'classnames';
import './base.less';

export interface ListItemProps {
  label?: any
  suffix?: React.ReactNode
  inline?: boolean
  compact?: boolean
  required?: boolean
  labelWidth?: number
  labelAlign?: 'left' | 'right'
  gutter?: number
  className?: string
  children?: React.ReactNode
  style?: CSSProperties
}

const prefixCls = 'custom-list-item';
export const classes = {
  field: prefixCls,
  inline: `${prefixCls}--inline`,
  compact: `${prefixCls}--compact`,
  required: `${prefixCls}--required`,

  header: `${prefixCls}__header`,
  container: `${prefixCls}__container`,
  footer: `${prefixCls}__footer`
}

export const ListItem = React.forwardRef((props: ListItemProps, ref: any) => {
  const {
    label,
    suffix,
    inline,
    compact,
    required,
    labelWidth,
    labelAlign,
    gutter,
    className,
    children,
    style,
  } = props

  const cls = classnames(
    classes.field,
    inline ? classes.inline : '',
    compact ? classes.compact : '',
    required ? classes.required : '',
    className ? className : ''
  )

  const headerStyle = {
    width: labelWidth,
    marginRight: gutter,
    textAlign: labelAlign
  }

  return (
    <div ref={ref} className={cls} style={style}>
      {label !== undefined && (
        <div className={classes.header} style={headerStyle}>
          {label}
        </div>
      )}
      <div className={classes.container}>
        {children}
      </div>
      {suffix !== undefined && <div className={classes.footer}>{suffix}</div>}
    </div>
  )
})

ListItem.displayName = 'ListItem';
