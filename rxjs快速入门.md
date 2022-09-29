# rxjs快速入门

一个基于可观测数据流 `Stream` ，结合观察者模式和迭代器模式的一种异步编程（同步）的应用库

函数式风格，一个函数负责一个功能。

rxjs只是一个js实现, 他是在其他语言都有实现的

### 基本概念：

流(observable实例)为随着时间维度生产数据（比如异步操作）的集合，它是rxjs中抽象出来的数据类型。在rxjs中通过创建操作符或者new的方式创建observable对象，作为流的处理过程中的一个基本单元。

### 抽象模型：

  生产者会产生内容-------->通过操作符创建消费者操作过程并控制吐出数据------>提供subscribe被消费者接收内容

类比：使用rxjs处理流类似于一个传送带，我们可以在任意节点(数据节点或流的节点)去操作流及其数据

![img](https://pic4.zhimg.com/80/v2-0e9cdcdd1938d816096f9eea220178e3_1440w.jpg)

```
import { Observable } from 'rxjs'
// observable(生产者)对象生产内容
const ob$ = Observable.create(observer => {
  // observer为观察者对象，会被subscrible
  observer.next(1);
  setTimeout(() => {
    observer.next(2);
    observer.complete();
  }, 1000);
});

// 观察者对象(消费者)接收内容
const observer = {
  next: result => console.log('result: ', result),
  error: err => console.error('something wrong occurred: ' + err),
  complete: () => console.log('done'),
};

// 观察者对象订阅生产者
ob$.subscribe(observer);
// 输出结果：
// result: 1
// result: 2
// done
```

### 解决问题

#### 1. 竞态危害

​    一段代码的执行结果依赖两个异步逻辑的彼此的执行顺序或者其他

切换tab执行异步请求，第二个tab展示了第一个tab的请求结果。

```
// 切换tab时执行请求
tabChange = (tabId) => {
  this.tabId = tabId;
  fetch(`/api?id=${tabId}`).then((data) => {
    if (this.tabId === data.tabId) {
      render();
    }
  });
}

onTabChange = debounce(this.tabChange, 300);

// --- 用rxjs实现
const tabSwitch$ = fromEvent(tab, 'click'); // 源observable
tabSwitch$.pipe(
    debounceTime(300), // 防抖操作
    switchMap((curTab) => from(fetch(`/api/${curTab}`))), // 接收一个映射函数，生成内部observable，每次源oberservable发出值，会取消前一个投影的内部observable的执行，重新订阅一个新的observable并执行
    tap(render), // 执行副作用操作
).subscribe();
```

上述代码：依赖不同tab进行的异步请求结果，并且需要保证请求返回的结果是点击当前tab产生的。

#### 2. 异步处理局限性

异步处理的方式：promise（提供内置方法有限，Promise.all([])），generators（写法不友好），async/await（基于gernerators，语法糖），callback（回调地狱），事件监听/发布订阅（代表rxjs提供了流的概念）。

案例1：请求控制最大并发数

```
const array = [
  'https://httpbin.org/ip', 
  'https://httpbin.org/user-agent',
  'https://httpbin.org/delay/3',
];
const source = from(array).pipe(mergeMap((api)=> new Promise(resolve => setTimeout(() => resolve(`Result: ${url}`), 2000)), 4)).subscribe(val => console.log(val));
```

案例2: 顺序执行

```
// 伪代码：实现按照顺序执行函数，当有值时返回值并终止执行
const paramslist = [1, 2, 3]
const source$ = from(paramslist).pipe(concatMap((rule) => handleRule(rule, value)), find((message) => message && typeof message === 'string'))
const message = await firstValueFrom(source$)
console.log(message, '顺序执行完毕符合条件的值')
```

案例3：轮询场景

```
// 间隔 1s 请求
this.timer$ = interval(1000)
    .pipe(
        switchMap(() => {
            return handlePromise(API);
        }),
    ).subscribe(
        (res: any) => {
            // 处理结果逻辑
        },
        // 报错
        () => {
            this.timer$.unsubscribe();
        },
        // 完成
        () => {
            this.timer$.unsubscribe();
        },
    );
```

轮询场景：按照时间间隔去轮询，根据结果或者时间去控制轮询是否要继续或者终止，如果终止了之后，我还想重启继续

### 多播（是一个概念）

单播：一个observable实例被单个 Observer （观察者对象）订阅。

多播：一个observable可以被多个Observer（观察者对象）订阅

hot observable：每一个新的`Observer`会从源 `Observable`发出的最新值开始接收

cold observable：虽然支持被多次订阅，但是每次被subscribe总是从头开始推送

![92028dca5289db620fa10a19223ec4b.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7c1f01d41bbc42c49b21987675cd155f~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp?)

#### 基本类别

##### Subject

  既可以作为Observer订阅上游的Observable（cold observable），也可以作为Observable（hot observable）被下游的Observer（观察者对象）订阅，从而实现hot observable的多播。只会在当前有新数据的时候给`Observer`发送当前的数据，而发送完毕之后如果还有新的`Observer`则不会在进行发送

##### BehaviorSubject

  Subject子类，在有新的`Observer`订阅时会额外发出最近一次发出的值，可以传递初始值作为参数

##### ReplaySubject

 Subject子类，会保存所有值，然后回放给新的订阅者，同时它提供了入参用于控制重放值的数量（默认重放所有）

##### AsyncSubject

Subject子类，只有当AsyncSubject执行完成，才会将最后一个值发给观察者，如果因异常而终止AsyncSubject将不会发出任何数据，但是会向`Observer`传递一个异常通知。

#### 操作符形式

##### connectable（基础）

定义可连接的多播的observable, 返回带connect的observable，需要调用connect才能执行observable给observer推送值。

##### refCount概念（基础）

对observable进行引用计数，当订阅的观察者数量为1时会自动发出源的值，没有订阅者的时候，会自动取消订阅；之后如果再重新被订阅，又从头开始发送值。

##### connect操作符（基础）

 `connect<T, O extends ObservableInput<unknown>>(selector: (shared: Observable<T>) => O,config: ConnectConfig<T> = DEFAULT_CONFIG): OperatorFunction<T, ObservedValueOf<O>>`

##### share操作符

`<T>(options?: {connector?: () => SubjectLike<T>;resetOnError?: boolean | ((error: any) => Observable<any>); resetOnComplete?: boolean | (() => Observable<any>); resetOnRefCountZero?: boolean | (() => Observable<any>);})=> MonoTypeOperatorFunction<T>` 等价于` pipe(connect(() => new Subject()), refCount())`，返回新的可多播observable，只要至少有一个订阅者，这个 Observable 就会被订阅并发送数据。当所有订阅者都取消订阅后，它将取消订阅源 Observable

##### shareReplay操作符

`<T>(configOrBufferSize?: number | ShareReplayConfig, windowTime?: number, scheduler?: SchedulerLike): MonoTypeOperatorFunction<T>` 通过`ReplaySubject`子类带有指定参数的构造来实现多播.

### 操作符

操作符就是rxjs基础的模型进行封装实现各种各样的功能的函数

#### 创建操作符

用来创建observable对象实例（也称为流）

##### 基础

```
import { Observable } from 'rxjs';
const ob$ = new Observable((oberserver) => {})
const ob$ = Observable.create(observer => {})
```

##### 同步类

range `(start: number, end: number, scheduler?: SchedulerLike)=>Observable<number>` 创建一个可发出指定范围内的数字序列的 Observable

repeat `(config: number | {count: number,delay: number})`接收参数，重复订阅源observable，可以多次调用，在前一个repeat执行完之前，不会调用下一个repeat。

throwError：`(error: ()=> any, scheduler?: SchedulerLike)=> Observable<never>` , 接收一个创建错误的函数，最终返回一个错误实例，并在订阅时将错误推送给消费者

##### 异步类

interval`(period: number = 0, scheduler: SchedulerLike = asyncScheduler)=>Observable<number>`接收时间间隔参数创建一个observable，可以根据时间间隔循环推送自增数列

timer `(startDue: number | Date, intervalOrScheduler?: number | SchedulerLike, scheduler: SchedulerLike = asyncScheduler)=>Observable<number>` 创建一个observable，startDue参数表示延迟执行，intervalOrScheduler表示延迟执行后隔一个间隔发出递增的序列数字

from：`<T>(input: ObservableInputTuple<T>, scheduler?: SchedulerLike)=>Observable<T>`从 Array、类数组对象、Promise、可迭代对象或类 Observable 对象创建 Observable

fromEvent`<T>(target: any, eventName: string, options: EventListenerOptions | ((...args: any[]) => T, resultSelector?: (...args: any[]) => T)=>Observable<T>`接收事件目标和事件函数创建observable.	

fromEventPattern `<T>(handle:(handler: NodeEventHandler)=>any,removeHandler?: (handler: NodeEventHandler, signal?: any) => void,resultSelector?: (...args: any[]) => T): Observable<T | T[]>)` 第一个参数为携带注册事件处理回调的函数，第二个参数为携带移除事件处理回调的函数。用来灵活处理含有事件的函数方法

##### 延迟创建类（我在订阅的时候才去创建observable）

defer `<R extends ObservableInputTuple<any> | void>(observableFactory: () => R): Observable<ObservedValueOf<R>>`  接受一个返回observable实例的函数，当订阅时才会创建observable。每次订阅都会生成新的observable

iff `<T, F>(condition: () => boolean, trueResult: ObservableInputTuple<T>, falseResult: ObservableInputTuple<F>)=>Observable<T | F>`, 在订阅的时候，会根据condition函数调用的结果，true则选择trueResult，false则选择falseResult

##### 组合创建类（都是根据多个流，返回一个observable）

concat `<O extends ObservableInputTuple<any>, R>(...observables: (SchedulerLike | O)[])=>Observable<ObservedValueOf<O> | R>` 接收多个流参数，按顺序执行，前一个流输出结果，后一个流才会执行

forkJoin `<T>(arg: T | any[])=>Observable<any[]> | Observable<{[K in keyof T]:ObservedValueOf<T[K]>}>` 接收数组或者对象集合（observable或者promise），等待所有Observables 完成，然后组合每项的最后一个值输出；如果传递了一个空数组，则立即完成

merge `(...args: (number | SchedulerLike | Observable<unknown> | InteropObservable<unknown> | AsyncIterable<unknown> | PromiseLike<unknown> | ArrayLike<unknown> | Iterable<unknown> | ReadableStreamLike<unknown>)[]): Observable<unknown>`  订阅多个obserable或其他，任意流吐出数据后，merge流就会吐出数据，当流全部完成时merge流结束

partition `<T>(source: ObservableInputTuple<any>, condition: (this: any, value: T, index: number) => boolean, thisArg: any)=>[Observable<T>, Observable<T>]` 将源 Observable 拆分为两个，一个具有满足谓词的值，另一个具有不满足谓词的值。

race `<T extends readonly unknown[]>(...observables: [...ObservableInputTuple<T>]): Observable<T[number]>`  订阅多个流，当其中一个触发后，退订其他流

zip `<A extends readonly unknown[]>(...sources: [...ObservableInputTuple<A>]): Observable<A>` 订阅所有流，等待所有的流都触发了`i`次，将第`i`次的数据合并成数组向下传递，当我们使用zip时，期望第一次接受到的数据是所有的流第一次发出的数据，第二次接受的是所有的流第二次发出的数据，依此类推

combineLatest `<A extends readonly unknown[]>(...observables: [...ObservableInputTuple<A>], resultSelector: (...values: A) => any, scheduler?: SchedulerLike): Observable<A>` 按顺序订阅多个observable。并且每当有任何 Observable 发出时，都会从每个 Observable 中收集一个新值组成一个数组输出。为了确保输出数组始终具有相同的长度，`combineLatest`实际上将等待所有输入 Observable 至少发出一次，然后才开始发出结果

##### 静态常量类

EMPTY：空observable，只会发出一个完成的通知，其他不会推送

NEVER:  一个不向观察者发射任何物品并且永远不会完成的Observable，用于测试或者配合其他Observables使用

#### 管道操作符（pipe管道）

##### 流的操作符

针对源observable和其他observable进行执行顺序、缓存、map映射转换操作（内部observable表示缓存区中待执行的observable）

map `<T>(project:(value:T,index?:number)=>any,thisArg?: any)=>`对源 observable 的每个值应用投射函数, 并在输出中输出该投影

expand `<T,O extends ObservableInputTuple<any>>(project:(value:T,index?:number)=>O,concurrent?:number, scheduler?: SchedulerLike)=>OperatorFunction<T, ObservedValueOf<O>>`源发出后，递归地将每个源值投影到一个 Observable，然后该observale结果会被输出，如果没有终止，则会一直重复执行投影函数，输出结果

groupBy `(keySelector:(value: any)=>any, elementOrOptions?: {element?: (value:any)=>any; duration?:(grouped: GroupedObservable) => ObservableInput<any>;connector?: () => SubjectLike<T>;})`基于keySelector函数生成的结果作为键，对源observable进行分组。elementOrOptions表示配置，包含三个参数.

concatAll `()=>OperatorFunction<O, ObservedValueOf<O>>` 针对源高阶observable转换成一阶observable执行concat的策略

concatAWith `<O extends ObservableInputTuple<any>, R>(...observables: (SchedulerLike | O)[])=>Observable<ObservedValueOf<O> | R>` 在源observable内部，接收多个observable，执行concat策略

concatMap `<T, I extends ObservableInput<any>>(project: (value: any, index: number) => I, resultSelector?: (outerValue: any, innerValue: ObservedValueOf<I>, innerValueIndex?: number) => any)=>OperatorFunction<T, any>` 在源observable内部，接收一个返回observable的函数，和源执行concat策略。

combineLatestAll `<O>(project?: (...values?: any[])=>O)=>OperatorFunction<any, O>` 针对高阶observable展平，订阅所有收集的 Observable 并使用combineLatest策略组合它们的值

combineLatestWith `<O extends ObservableInputTuple<any>, R>(...observables: (SchedulerLike | O)[])=>Observable<ObservedValueOf<O> | R>` 在源observable内部，接收多个observable，执行combineLatest策略

raceWith `raceWith<T, A extends readonly unknown[]>(...otherSources: [...ObservableInputTuple<A>]): OperatorFunction<T, T | A[number]>` 在源内部，接收多个observable，执行race策略

zipAll `<O>(project?: (...values?: any[])=>O)=>OperatorFunction<any, O>`  针对源高阶observable转换成一阶observable执行zip的策略

zipWith `<O extends ObservableInputTuple<any>, R>(...observables: (SchedulerLike | O)[])=>Observable<ObservedValueOf<O> | R>` 在源observable内部，接收多个observable，执行zip策略

mergeAll `<O>(concurrent?: number)=>OperatorFunction<O, ObservedValueOf<O>>` 针对源高阶observable转换成一阶observable执行merge的策略, 参数表示并发执行数

mergeWith `<T, A extends readonly unknown[]>( ...otherSources:[...ObservableInputTuple<A>]): OperatorFunction<T, T | A[number]>` 在源observable内部，接收多个observable，执行merge策略

mergeMap`<T,I>(project: (value?: T, index?:number) => I, concurrent?:number)=>OperatorFunction<T, ObservedValueOf<O>>` 在源observable内部，接收一个返回observable的函数，执行merge策略。

mergeScan `<T>(accumulator: (acc:any, source:T, index?: number)=>=> ObservableInput<any>, initialValue: any,concurrent?: number)=>OperatorFunction<T, R>`在源 Observable 上应用累加器函数,  每次源发出都会执行累加器函数并发出值

withLatestFrom `<T,R>(...inputs: any[])=>OperatorFunction<T, R | any[]>` 在源observable内部，接收多个其他observable，当源发出值时，与来自其他输入 Observable 的最新值组合在一起作为数组发出，为了确保输出数组始终具有相同的长度，所有输入 Observable 必须发出至少一个值。

exhaustAll `()=>OperatorFunction<O, ObservedValueOf<O>>` 针对源高阶函数的执行，如果前一个内部observable尚未完成，则新出现的内部observable会被丢弃

exhaustMap `<T, I extends ObservableInput<any>>(project: (value: any, index: number) => I, resultSelector?: (outerValue: any, innerValue: ObservedValueOf<I>, innerValueIndex?: number) => any)=>OperatorFunction<T, any>` 在源observable内部，将每个源值投影到一个 Observable，如果前一个投影的 Observable 尚未完成，则忽略每个新的投影 Observable

switchAll `<O>()=>OperatorFunction<O, ObservedValueOf<O>>` 针对源高阶函数的执行，订阅源发出的最近提供的“内部 observable”，取消订阅任何先前订阅的内部 observable

switchMap`<T, I extends ObservableInput<any>>(project: (value: any, index: number) => I, resultSelector?: (outerValue: any, innerValue: ObservedValueOf<I>, innerValueIndex?: number) => any)=>OperatorFunction<T, any>` 在源observable内部，接收一个返回observable的函数, 当一个新的内部 Observable 被发出时，则停止前面发出的旧observables

switchScan `<T>(accumulator: (acc:any, source:T, index?: number)=>=> ObservableInput<any>, initialValue: any)=>OperatorFunction<T, R>` 在源 Observable 上应用累加器函数,  仅从最近返回的 Observable 发出值。

buffer `<T>(closingNotifier: Observable<any>)=>OperatorFunction<T, T[]>` 缓冲源 Observable 值直到`closingNotifier`发出。

bufferCount `<T>(bufferSize:number, startNewTimer?: number)=>OperatorFunction<T, T[]>` 在源内部，在特定的bufferSize数量内缓冲来自源的值，startNewTimer表示什么时候开启新的缓冲区

bufferTime `<T>(bufferTimeSpan?:number,bufferCreationInterval?:number, maxBufferSize?:number,scheduler?: SchedulerLike)=>OperatorFunction<T, T[]>` 在源内部，在特定的bufferTimeSpan时间内缓冲来自源的值，bufferCreationInterval表示什么时候开启新的缓冲区并重置发出旧缓冲区

bufferToggle `<T,O>(openings: ObservableInput<O>, closingSelector: (value: O) => ObservableInput<any>)=>OperatorFunction<T, T[]>` 在源内部，`opening`仅在发出时开始收集源的值，并调用该`closingSelector` 函数以获取告诉何时重置缓冲区并发出结果的Observable

bufferWhen `<T>(closingSelector:  () => ObservableInput<any>)=>OperatorFunction<T, T[]>` 在源内部，缓冲源 Observable 值，使用关闭 Observables 的工厂函数来确定何时关闭、发出和重置缓冲区。

window `<T>(windowBoundaries: Observable<any>): OperatorFunction<T, Observable<T>>` 

##### 值的操作符	

控制流的值的发出

every `<T>(predicate:(value?:T,index?:number,source?:Observable<T>)=>boolean, thisArg?: any)=>OperatorFunction<T, boolean>` 源的每个值是否满足predicate条件，满足输出true，否则false

find `<T>(predicate:(value?:T,index?:number,source?:Observable<T>)=>boolean, thisArg?: any)=>OperatorFunction<T, T | undefined>` 仅发出满足某些条件的源 Observable 发出的第一个值，没有值则返回undefined

findIndex `<T>(predicate: (value: T, index: number, source: Observable<T>) => boolean, thisArg?: any): OperatorFunction<T, number>` 仅发出满足某些条件的源 Observable 发出的第一个值的索引。

filter `<T>(predicate: (value: T, index: number) => boolean, thisArg?: any): MonoTypeOperatorFunction<T>` 通过仅发出满足指定predicate的项来过滤源 Observable 发出的项

reduce `<V, A>(accumulator: (acc: V | A, value: V, index: number) => A, initialValue?: any): OperatorFunction<V, V | A>`  使用累加器函数将源上发出的所有值累加，当源 observable 完成时将这个值发出。

scan `(accumulator: (acc: any, value: any, index: number) => any, initialValue?: any): OperatorFunction<any, any>` 针对源发出的每一个值随着时间的推移进行累加归并。累加过程中每一次都会输出值

first `<T, D>(predicate?: (value: T, index: number, source: Observable<T>) => boolean, defaultValue?: D): OperatorFunction<T, T | D>`不带参数，发出源observable的第一个值，接收条件函数参数的话，发出满足条件的第一个值, 如果没有defaultValue且未找到满足值则会引发错误

last `<T, D>(predicate?: (value: T, index: number, source: Observable<T>) => boolean, defaultValue?: D): OperatorFunction<T, T | D>`不带参数，发出源observable的最后一个值，接收条件函数参数的话，发出满足条件的最后一个值，如果没有defaultValue且未找到满足值则会引发错误

audit `<T>(durationSelector: (value: T) => ObservableInput<any>): MonoTypeOperatorFunction<T>` 在另外一个observable持续时间内忽略该值，结束时发出最新的源值。跟节流不同，节流是在持续时间中只发出第一个值

auditTime `<T>(duration: number, scheduler: SchedulerLike = asyncScheduler): MonoTypeOperatorFunction<T>` 接收时间参数，在持续时间内执行audit操作

debounce `<T>(durationSelector: (value: T) => ObservableInput<any>): MonoTypeOperatorFunction<T>` 只有在其他Observable持续时间内且没有另一个源发射时，才从源 Observable 发出通知。

debounceTime `<T>(duration: number, scheduler: SchedulerLike = asyncScheduler): MonoTypeOperatorFunction<T> `接收时间参数，在持续时间内执行debounce操作

throttle `<T>(durationSelector: (value: T) => ObservableInput<any>, config: ThrottleConfig = defaultThrottleConfig): MonoTypeOperatorFunction<T>` 在另一个observable持续时间内只发出源的第一个值，忽略后续值

throttleTime `<T>(duration: number, scheduler: SchedulerLike = asyncScheduler, config: ThrottleConfig = defaultThrottleConfig): MonoTypeOperatorFunction<T>` 接收时间参数，执行throttle操作

sample `<T>(notifier: Observable<any>): MonoTypeOperatorFunction<T>` 每当另一个 Observable发出时，发出源Observable最近发出的值

sampleTime `<T>(period: number, scheduler: SchedulerLike = asyncScheduler): MonoTypeOperatorFunction<T>` 接收时间参数，以周期性的时间间隔对源 Observable 进行采样，并发出自上一次采样以来最近发出的值

distinct`<T, K>(keySelector?: (value: T) => K, flushes?: Observable<any>): MonoTypeOperatorFunction<T>` 在源发出的所有值中，当前项与之前的任意项都不同的将被发出，keySelector为目标比较的字段筛选函数

distinctUntilChanged `<T, K>(comparator?: (previous: K, current: K) => boolean, keySelector: (value: T) => K = identity as (value: T) => K): MonoTypeOperatorFunction<T>`在源observable推送的值集合中，无参数时，当前源值只有和前一个源值不同才会被发出，有参数时应用comparator比较函数，存在不满足的结果则被发出

ignoreElements `(): OperatorFunction<unknown, never>`除了完成和报错，忽略所有通知

single`<T>(predicate?: (value: T, index: number, source: Observable<T>) => boolean): MonoTypeOperatorFunction<T>` 它断言只有一个与predicate匹配的源observable 发出一个值。如果没有提供predicate，那么源observable 只发出一个值。

skip `<T>(count: number): MonoTypeOperatorFunction<T>` 接收一个数字，表示跳过源observable发出的前几个值

skipLast `<T>(skipCount: number): MonoTypeOperatorFunction<T>` 接收一个数字，表示跳过后面几个源observable发出的值

skipUntil `<T>(notifier: Observable<any>): MonoTypeOperatorFunction<T>`  当提供的notifier发出时，会开始发出源的值。开始后就不会被再影响

skipWhile `<T>(predicate: (value: T, index: number) => boolean): MonoTypeOperatorFunction<T>` 只要指定条件predicate成立，它就会跳过源 Observable 发出的所有项目，但一旦条件变为 false，才会开始发出源的值，开始后就不会被再影响

take `<T>(count: number): MonoTypeOperatorFunction<T>` 仅发出源的前count个值，然后立即完成

takeLast `<T>(count: number): MonoTypeOperatorFunction<T>` 等待源完成，然后根据count参数的指定从源发出最后count个值。

takeUntil `<T>(notifier: ObservableInput<any>): MonoTypeOperatorFunction<T>` 接收一个observable，当其发出值时，则停止发出源observable的值, 立即完成

takeWhile `<T>(predicate: (value: T, index: number) => boolean, inclusive: boolean = false): MonoTypeOperatorFunction<T>` 接收一个条件函数，源发出的值满足条件时则可以发出，不满足时则立即完成

##### 工具操作符

tap `<T>(observerOrNext?: Partial<TapObserver<T>> | ((value: T) => void), error?: (e: any) => void, complete?: () => void): MonoTypeOperatorFunction<T>`对源 Observable 上的每个发射执行副作用，但返回与源相同的 Observable

delay `<T>(due: number | Date, scheduler: SchedulerLike = asyncScheduler): MonoTypeOperatorFunction<T>` 根据给定时间延迟或者到目标时间才会发出值。

delayWhen `<T>(delayDurationSelector: (value: T, index: number) => Observable<any>, subscriptionDelay?: Observable<any>): MonoTypeOperatorFunction<T>` 延迟发出源的值，直到delayDurationSelector返回的observable发出值，subscriptionDelay发出它的第一个值或完成时，源 Observable 被订阅

finalize `<T>(callback: () => void): MonoTypeOperatorFunction<T>` 当源在 complete 或 error终止时将调用callback

timeout `<T, O extends ObservableInput<any>, M>(config: number | Date | TimeoutConfig<T, O, M>, schedulerArg?: SchedulerLike): OperatorFunction<T, T | ObservedValueOf<O>>` 如果 Observable 在给定的时间范围内没有发出值，则会出错

toArray `<T>(): OperatorFunction<T, T[]>` 收集所有源发出的值，并在源完成时将它们作为数组发射。

##### 错误处理

catchError：通过返回新的 observable 或抛出错误来捕获要处理的 observable 上的错误。

#### 自定义操作符

会想到react的hooks，hooks也是有自定义hook的

两种方式：

（1）扩展Oberverable类（不推荐）

（2）纯函数实现（这种是通过pipe调用）

```
// 小写转换成大写自定义操作符：基础版本
const toUpperCase = () => source => Observable.create(subscriber => {
    const subscription = source.subscribe(
        value => {
            try {
                subscriber.next(value.toUpperCase());
            }catch(error) {
                subscriber.error('Some error occur: ' + err.toString());
            }
        },
        err =>  { subscriber.error(err) },
        () => { subscriber.complete()}
    )
    return subscription;
});
// 转换成大写操作符：优化版本，借用已有的操作符封装
import { catchError, map } from 'rxjs';
const toUpperCase = () => source => source.pipe(
  map(value => value.toUpperCase()),
  catchError(err => of('Some error occur: ' + err.toString()))
);
// 拓展上述的自定义操作，加入形参
const calculate = fn => source => source.pipe(
    map(value => fn(value)),
    catchError(err => of(err))
);
// 自定义操作符使用
const obs = of(5);
obs.pipe(calculate(value => Math.pow(value, 2))).subscribe(console.log); // 输出 25;

```

### 辅助方法

我们想像async/await这种形式取值

#### lastValueFrom

当你知道Observable最终会完成时使用这个函数可以获得流的发出的最后一个值。需要处理没有完成或发出的异常情况避免挂起到内存中

#### firstValueFrom

如果你想第一个值到达时获取它而不等待 Observable 完成，则调用此函数，并且将立即取消订阅以保留资源

### 流的调度

用来控制事件发出的顺序和速度的(发送给观察者的)。它还可以控制订阅的顺序

#### FAQ

1. 什么时候使用

   在需要的时候使用，比如你进行一些同步操作，比如数组啥的过滤操作就不需要用rxjs去管理数据，但是对于一些异步操作，比如异步遍历操作，多个异步之间的操作，比较难处理的可以考虑使用，常规的尽量不要使用。

2. 快速学习路线

   先搞清楚基本的概念模型，再配合官方文档就可以了，其他的文章只能参考，很多都过期了。

   官方文档：https://rxjs.dev/guide/overview