import React from 'react';
import { CustomUnionType, FormComponent, GeneratePrams } from "../types";
import { isReactComponent, isValidChildren } from "@/utils/ReactIs";
import { isObject } from '@/utils/type';

// 解析组件声明
export const parseComponent = (target: CustomUnionType | undefined, typeMap?: { [key: string]: React.ElementType }) => {
  if (target === undefined) return;
  if (isValidChildren(target)) return null;
  // 是否为类或函数组件声明
  if (isReactComponent(target)) {
    return target as any
  }
  // 是否为已注册的组件声明
  if (isObject(target)) {
    const targetInfo = target as FormComponent;
    const register = typeMap && targetInfo?.type && typeMap[targetInfo?.type];
    if (register) {
      return register
    }
  }
  return null;
}

// 生成组件实例
export const createInstance = (target?: any, typeMap?: { [key: string]: React.ElementType }, commonProps?: GeneratePrams): any => {
  if (target instanceof Array) {
    return target?.map((item) => {
      return createInstance(item, typeMap, commonProps);
    });
  } else {
    const Child = parseComponent(target, typeMap) as React.ElementType;
    // 声明组件
    if (Child) {
      const { children, ...restProps } = (target as FormComponent)?.props || {};
      return (
        <Child {...Object.assign({}, commonProps, restProps)}>
          {createInstance(children, typeMap, commonProps)}
        </Child>
      );
    } else {
      return isValidChildren(target) ? target : null
    }
  }
}
