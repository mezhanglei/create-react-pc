import { joinFormPath } from '@/components/react-easy-formcore';
import classnames from 'classnames';
import React, { useState } from 'react';
import { GeneratePrams } from '../../form-render';
import './baseSelection.less';
import { useFormDesign, useFormEdit } from '../../form-render/utils/hooks';
import pickAttrs from '@/utils/pickAttrs';
import { SelectedType } from '../designer-context';
import { ELementProps } from '../../form-render/components';

export type CommonSelectionProps = GeneratePrams<ELementProps> & React.HtmlHTMLAttributes<any>;
export interface EditorSelectionProps extends CommonSelectionProps {
  tools?: any[]; // 工具栏
  attributeName?: string; // 属性路径
  configLabel?: string; // 当前组件的名字
  onChoose?: (selected?: SelectedType) => void; // 
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
    configLabel,
    tools,
    onMouseOver,
    onMouseOut,
    onChoose,
    ...restProps
  } = props;

  const [isOver, setIsOver] = useState<boolean>(false);
  const { setEdit } = useFormEdit();
  const { selected, eventBus } = useFormDesign();
  const completePath = joinFormPath(path, attributeName) as string;
  const currentPath = joinFormPath(selected?.path, selected?.attributeName);
  const isSelected = completePath ? completePath === currentPath : false;

  const nextSelected = {
    name: name,
    path: path,
    parent: parent,
    attributeName: attributeName,
    field: field,
  }

  const chooseItem = (e: any) => {
    e.stopPropagation();
    if (onChoose) {
      onChoose(nextSelected);
      return;
    }
    setEdit({
      selected: nextSelected
    });
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
    eventBus && eventBus.emit('hover', nextSelected);
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
      {isOver && !isSelected && configLabel && <div className={classes.label}>{configLabel}</div>}
      {isSelected && <div className={classes.tools}>{tools}</div>}
      {children}
    </div>
  );
};

export default React.forwardRef(BaseSelection);
