/**
 * 监听-订阅者模式(通过监听时设定事件名，来保证多个事件的监听与触发不会相互干扰)
 * 
 * 使用：1. 继承或实例化一个类const WatchableStore = new WatchableStore()
 *      2. 监听目标事件，const type = WatchableStore.wath(事件名, 目标事件)，返回一个事件type(也就是事件名)
 *      3. 通过WatchableStore.trigger(type, data)来触发对应的监听事件,并传递参数给监听的事件
 *             WatchableStore.triggerAll(data) 触发所有监听的事件
 *      4. 通过WatchableStore.unwatch(type), 卸载对应的目标事件
 */
export class WatchableStore {
    _watchers: { type: string; handle: Function }[] = [];

    // 触发事件池里的所有事件(所以监听多个事件，那么触发时会全部触发)
    triggerAll(data: unknown) {
        this._watchers.forEach(watcher => {
            watcher.handle(data);
        });
    }

    // 触发事件池里对应type的事件
    trigger(type: string, data: unknown) {
        this._watchers.forEach(watcher => {
            if (watcher.type == type) {
                watcher.handle(data);
            }
        });
    }

    // 监听事件，设置事件类型type和要监听的事件
    watch(type: string, func: Function) {
        this._watchers.push({ type, handle: func });
        return type;
    }

    // 根据监听事件时的type卸载对应的事件
    unwatch(type: string) {
        for (let i = 0; i < this._watchers.length; i++) {
            if (this._watchers[i].type === type) {
                this._watchers.splice(i, 1);
                break;
            }
        }
    }
}
