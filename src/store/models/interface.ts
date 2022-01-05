
import type { Reducer } from 'redux';
import type { Effect, EffectType, Model as DvaModel, EffectsCommandMap } from 'dva';
import { CommonState } from './common/interface';

interface Action {
    type: string;
    payload: unknown;
}
interface ReducersMapObject<S> {
    [key: string]: Reducer<S, Action>;
}

export interface ReducerEnhancer<S> {
    (reducer: Reducer<S, Action>): Reducer<S, Action>;
}

export interface Model<ModelNameSpace, S> {
    namespace: ModelNameSpace;
    state?: S;
    reducers?: ReducersMapObject<S> | [ReducersMapObject<S>, ReducerEnhancer<S>];
    effects?: Record<string, Effect | [(emp: EffectsCommandMap) => void, { type: EffectType }]>;
    subscriptions?: DvaModel['subscriptions'];
}

/** 规定 reducer中的处理函数 接收state 和 payload 返回计算处理过后的state */
export type ReducerStateHandler<State, Payload> = (state: State, payload: { type: string; payload: Payload }) => State;
// reducer函数类型
export type ReducerHandler<P> = ReducerStateHandler<CommonState, P>;
// promise函数执行后的返回值
export type GetPromiseReturnType<P extends (...args: any[]) => any> = ReturnType<P> extends Promise<infer X> ? X : never;