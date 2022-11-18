import * as handleReducers from './reducers';
import * as handleEffects from './effects';
import initState from './initState';
import type { CommonModel } from './interface';
import { namespace } from './interface';
import { fetchUserInfo } from './actions';

// 将module类转换成对象
const reducers = Object.fromEntries(
  Object.entries(handleReducers).map(
    ([fnName, fn]) => {
      return [fnName, fn];
    }
  )
);

// 将module类转换成对象
const effects = Object.fromEntries(
  Object.entries(handleEffects).map(
    ([fnName, fn]) => {
      return [fnName, fn];
    }
  )
);

export default {
  namespace: namespace,
  state: initState,
  reducers: reducers,
  effects: effects,
  subscriptions: {
    async setup({ dispatch }) {
      // await dispatch(fetchUserInfo())
    }
  }
} as CommonModel;
