import React from 'react';
import { CustomUnionType, FormComponent, GenerateParams } from "../types";
import { isReactComponent } from "@/utils/ReactIs";
import { isEmpty, isObject } from '@/utils/type';

// 是否为注册组件
export const isFormRegistered = (target?: any, typeMap?: { [key: string]: React.ElementType }) => {
  const Com = isObject(target) && typeMap && typeMap[(target as FormComponent).type || ''];
  return Com;
}

// 解析组件声明
export const parseComponent = (target: CustomUnionType | undefined, typeMap?: { [key: string]: React.ElementType }) => {
  // 是否为空
  if (isEmpty(target)) return target;
  // 如果是react元素则返回空
  if (React.isValidElement(target)) return null;
  // 是否为注册组件
  const Com = isFormRegistered(target, typeMap);
  if (Com) {
    return Com;
  }
  if (isReactComponent(target)) return target;
  return null;
}

// 渲染组件
export const renderComponent = (target?: any, typeMap?: { [key: string]: React.ElementType }, commonProps?: GenerateParams): any => {
  // 如果为列表
  if (target instanceof Array) return target.map((item) => renderComponent(item, typeMap, commonProps));
  // 是否为注册组件
  const Com = isFormRegistered(target, typeMap);
  if (Com) {
    const { children, ...rest } = target?.props || {};
    const mergeProps = Object.assign({}, commonProps, rest);
    return (
      <Com {...mergeProps}>
        {renderComponent(children, typeMap, commonProps)}
      </Com>
    );
  }
  // 是否为React元素
  if (React.isValidElement(target) || typeof target === 'string' || typeof target === 'number') return target;
  return null;
}
