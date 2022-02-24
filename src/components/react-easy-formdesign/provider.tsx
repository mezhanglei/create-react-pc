import React, {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
  useState,
} from 'react';
import { Ctx, StoreContext } from './design-context';



// TODO: formData 不存在的时候会报错：can't find # of undefined
function Provider(props, ref) {

  const {
    children
  } = props;

  return (
    <Ctx.Provider value={222}>
      <StoreContext.Provider value={111}>{children}</StoreContext.Provider>
    </Ctx.Provider>
  );
}

export default forwardRef(Provider);