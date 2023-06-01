import React from 'react';
import { isValidChildren } from "@/utils/ReactIs";
import { FormComponent, GeneratePrams } from "../types";
import { parseComponent } from "./utils";

// 生成组件实例
const createInstance = (target?: any, typeMap?: { [key: string]: React.ElementType }, commonProps?: GeneratePrams): any => {
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
        <Child {...commonProps} {...restProps}>
          {createInstance(children, typeMap, commonProps)}
        </Child>
      );
    } else {
      return isValidChildren(target) ? target : null
    }
  }
}

export default createInstance;
