import React from 'react';
import { FormRenderStore } from '../react-easy-formrender';

// 渲染表单需要的值
export interface FormRenderCtxProps {

}
// 表单编辑器操作方法
export interface FormEditParams {

}
export type FormEditCtxFn = (state: Partial<FormEditParams>) => void;
// 表单渲染的context
export const FormRenderContext = React.createContext<FormRenderCtxProps | {}>({})
// 编辑器相关操作的context
export const FormEditContext = React.createContext<FormEditCtxFn>()
