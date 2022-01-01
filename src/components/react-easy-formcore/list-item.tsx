import React, { CSSProperties } from 'react'
import classnames from 'classnames';
import './list-item.less';

export interface ListItemProps {
  label?: any
  suffix?: React.ReactNode
  inline?: boolean
  required?: boolean
  labelWidth?: number
  labelAlign?: 'left' | 'right'
  gutter?: number
  className?: string
  children?: React.ReactNode
  style?: CSSProperties
}

const prefixCls = 'custom-list-item';
export const classes_item = {
  field: prefixCls,
  inline: `${prefixCls}--inline`,
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
    required,
    labelWidth,
    labelAlign,
    gutter,
    className,
    children,
    style,
  } = props

  const cls = classnames(
    classes_item.field,
    inline ? classes_item.inline : '',
    required ? classes_item.required : '',
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
        <div className={classes_item.header} style={headerStyle}>
          {label}
        </div>
      )}
      <div className={classes_item.container}>
        {children}
      </div>
      {suffix !== undefined && <div className={classes_item.footer}>{suffix}</div>}
    </div>
  )
})

ListItem.displayName = 'ListItem';
