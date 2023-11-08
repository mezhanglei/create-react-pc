import { joinFormPath } from '@/components/react-easy-formcore';
import classnames from 'classnames';
import React, { useState } from 'react';
import { GenerateParams } from '../../index';
import './index.less';
import pickAttrs from '@/utils/pickAttrs';
import { ELementProps } from '../../components';
import { asyncSettingForm } from '../../utils/utils';

export type SelectedType = GenerateParams<ELementProps> & {
  setting?: ELementProps['setting']; // 当前选中项的属性
  attributeName?: string; // 树节点中的属性路径
};
export type CommonSelectionProps = GenerateParams<ELementProps> & React.HtmlHTMLAttributes<any>;
export interface EditorSelectionProps extends CommonSelectionProps {
  tools?: any[]; // 工具栏
  attributeName?: string; // 属性路径
  configLabel?: string; // 当前组件的名字
  onChoose?: (selected?: any) => void; // 
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
    formrender: editor,
    form: editorForm,
    configLabel,
    tools,
    onMouseOver,
    onMouseOut,
    onChoose,
    ...restProps
  } = props;

  const [isOver, setIsOver] = useState<boolean>(false);
  const { setContextValue, settingForm, selected, eventBus } = field?.context || {};
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
    setContextValue({
      selected: nextSelected
    });
    // 订阅选中事件
    eventBus && eventBus.emit('choose', nextSelected);
    // 点击选中时同步编辑区域值到属性区域
    asyncSettingForm(settingForm, editor, nextSelected);
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
      {isOver && !isSelected && configLabel && <div className={classes.label}>{configLabel}</div>}
      {isSelected && <div className={classes.tools}>{tools}</div>}
      {children}
    </div>
  );
};

export default React.forwardRef(BaseSelection);
