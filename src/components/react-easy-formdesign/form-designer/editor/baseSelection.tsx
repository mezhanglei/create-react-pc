import { joinFormPath } from '@/components/react-easy-formcore';
import classnames from 'classnames';
import React, { useState } from 'react';
import { GeneratePrams } from '../../form-render';
import './baseSelection.less';
import { ELementProps } from '../components/configs';
import { useFormDesign, useFormEdit } from '../../utils/hooks';
import pickAttrs from '@/utils/pickAttrs';

export type CommonSelectionProps = GeneratePrams<ELementProps> & React.HtmlHTMLAttributes<any>;
export interface EditorSelectionProps extends CommonSelectionProps {
  tools?: any[]; // 工具栏
  attributeName?: string; // 属性路径
  componentLabel?: string; // 当前组件的名字
}
/**
 * 基础选择框组件
 * @param props 
 * @param ref 
 * @returns 
 */
function BaseSelection(props: EditorSelectionProps, ref: any) {
  const {
    children,
    className,
    name,
    path,
    parent,
    attributeName,
    field,
    formrender: designer,
    form: designerForm,
    tools,
    onMouseOver,
    onMouseOut,
    componentLabel,
    ...restProps
  } = props;

  const [isOver, setIsOver] = useState<boolean>(false);
  const setEdit = useFormEdit();
  const { selected } = useFormDesign();
  const completePath = joinFormPath(path, attributeName) as string;
  const currentPath = joinFormPath(selected.path, selected?.attributeName);
  const isSelected = completePath ? completePath === currentPath : false;

  const chooseItem = (e: any) => {
    e.stopPropagation();
    setEdit({
      selected: {
        name: name,
        path: path,
        attributeName: attributeName,
        field: field,
        parent: parent,
      }
    })
  }

  const prefixCls = "editor-selection";
  const overCls = `${prefixCls}-over`;
  const handleMouseOver = (e: any) => {
    e.stopPropagation();
    const target = e.currentTarget as HTMLElement;
    if (target) {
      target.classList.add(overCls);
      setIsOver(true);
    }
    onMouseOver && onMouseOver(e);
  }

  const handleMouseOut = (e: any) => {
    e.stopPropagation();
    const target = e.currentTarget as HTMLElement;
    if (target) {
      target.classList.remove(overCls);
      setIsOver(false);
    }
    onMouseOut && onMouseOut(e);
  }

  const cls = classnames(prefixCls, className, {
    [`${prefixCls}-active`]: isSelected,
  });

  const classes = {
    mask: `${prefixCls}-mask`,
    tools: `${prefixCls}-tools`,
    label: `${prefixCls}-label`,
  }

  return (
    <div ref={ref} className={cls} {...pickAttrs(restProps)} onClick={chooseItem} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
      {isOver && !isSelected && componentLabel && <div className={classes.label}>{componentLabel}</div>}
      {isSelected && <div className={classes.tools}>{tools}</div>}
      {children}
      {field?.disabledEdit && <div className={classes.mask}></div>}
    </div>
  );
};

export default React.forwardRef(BaseSelection);
