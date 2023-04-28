import { joinFormPath } from '@/components/react-easy-formcore';
import classnames from 'classnames';
import React from 'react';
import { GeneratePrams } from '../../form-render';
import './baseSelection.less';
import { ELementProps } from '../components/configs';
import { useFormDesign, useFormEdit } from '../../utils/hooks';
import { isEmpty } from '@/utils/type';
import pickAttrs from '@/utils/pickAttrs';

export type CommonSelectionProps = GeneratePrams<ELementProps> & React.HtmlHTMLAttributes<any>;
export interface EditorSelectionProps extends CommonSelectionProps {
  tools?: any[]; // 工具栏
  attributeName?: string; // 属性路径
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
    style,
    className,
    name,
    parent,
    formparent,
    attributeName,
    field,
    store: designer,
    form: designerForm,
    tools,
    onMouseOver,
    onMouseOut,
    ...restProps
  } = props;

  const setEdit = useFormEdit();
  const { selected, selectedPath } = useFormDesign();
  const completePath = isEmpty(name) ? attributeName : joinFormPath(parent, name, attributeName) as string;
  const isSelected = completePath ? completePath === joinFormPath(selectedPath, selected?.attributeName) : false;

  const chooseItem = (e: any) => {
    e.stopPropagation();
    setEdit({
      selected: {
        name: name as string,
        attributeName: attributeName,
        parent: parent,
        formparent: formparent,
        field: field
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
    }
    onMouseOver && onMouseOver(e);
  }

  const handleMouseOut = (e: any) => {
    e.stopPropagation();
    const target = e.currentTarget as HTMLElement;
    if (target) {
      target.classList.remove(overCls);
    }
    onMouseOut && onMouseOut(e);
  }

  const cls = classnames(prefixCls, className, {
    [`${prefixCls}-active`]: isSelected,
  });

  const classes = {
    mask: `${prefixCls}-mask`,
    tools: `${prefixCls}-tools`
  }

  return (
    <div ref={ref} className={cls} style={style} onClick={chooseItem} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut} {...pickAttrs(restProps, { aria: true, data: true })}>
      {
        isSelected &&
        <div className={classes.tools}>
          {tools}
        </div>
      }
      {children}
      {field?.disabledEdit && <div className={classes.mask}></div>}
    </div>
  );
};

export default React.forwardRef(BaseSelection);
