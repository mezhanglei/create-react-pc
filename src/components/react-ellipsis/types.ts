import { ReactNode } from 'react';

export interface EllipsisProps {
  text: string; // 需要缩略的纯文本
  ellipsis: boolean; // 是否开启缩略
  dangerouslyUseInnerHTML?: boolean; // 将 text 当做 html 解析（请确保传递的 text 安全可靠，否则可能导致 XSS 安全问题）
  maxLine?: number; // 	超过该行数时文本会被裁剪
  visibleLine?: number; // 文本可见行数（不能大于 maxLine）
  maxHeight?: number; // 	超过该高度时文本会被裁剪，优先级高于 maxLine
  visibleHeight?: number; // 文本可见高度，优先级高于 visibleLine
  ellipsisNode?: ReactNode; // 自定义缩略符节点
  endExcludes?: string[]; // 结尾处希望被过滤掉的字符（在缩略符之前）
  reflowOnResize?: boolean; // 	容器大小改变时是否重新布局，原生缩略支持时默认是 true，否则为 false
  onReflow?: (ellipsis: boolean, text: string) => void; // 重排完成回调事件。参数 ellipsis 表示文本是否被截断；参数 text 为可见文本（不包含缩略符）
  onEllipsisClick?: () => void; // 	缩略符点击回调事件
}
