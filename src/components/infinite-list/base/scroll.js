import { Event, Hooks } from './const';
import Core from './core';

export default class Scroll extends Core {
    static warning(msg) {
        console.error(`[react-fast-scroll]: ${msg}`);
    }

    static info(msg) {
        console.info(`[react-fast-scroll]: ${msg}`);
    }

    constructor(options) {
        super(options);
        this.hooks = Hooks;
        this.initEvent();
    }

    on(type, fn) {
        this.hooks[type].push(fn);
    }

    trigger(type, ...args) {
        const hooks = this.hooks[type];
        if (!hooks) return;

        for (let fn of hooks) {
            fn.apply(this, args);
        }
    }

    // 与 removeEventListener 类似，都需要传入函数引用
    off(type, fn) {
        const hooks = this.hooks[type];
        if (!hooks) return;
        this.hooks[type] = this.hooks[type].filter(_fn => _fn !== fn);
    }

    initEvent() {
        this.addEvent(Event.PULL_DOWN, (height, offset) => {
            this.hooks[Event.PULL_DOWN] && this.trigger(Event.PULL_DOWN, height, offset);
        });

        this.addEvent(Event.PULL_UP, (showLoading) => {
            this.hooks[Event.PULL_UP] && this.trigger(Event.PULL_UP, showLoading);
        });

        this.addEvent(Event.PULLING_DOWN, (height, offset) => {
            this.hooks[Event.PULLING_DOWN] && this.trigger(Event.PULLING_DOWN, height, offset);
        });

        this.addEvent(Event.SCROLL, (scrollTop) => {
            this.hooks[Event.SCROLL] && this.trigger(Event.SCROLL, scrollTop);
        });

        this.addEvent(Event.CANCEL_PULL_DOWN, () => {
            this.hooks[Event.CANCEL_PULL_DOWN] && this.trigger(Event.CANCEL_PULL_DOWN);
        });

        this.addEvent(Event.TOUCHSTART, (e) => {
            this.hooks[Event.TOUCHSTART] && this.trigger(Event.TOUCHSTART, e);
        });

        this.addEvent(Event.TOUCHMOVE, (e) => {
            this.hooks[Event.TOUCHMOVE] && this.trigger(Event.TOUCHMOVE, e);
        });

        this.addEvent(Event.TOUCHEND, (e) => {
            this.hooks[Event.TOUCHEND] && this.trigger(Event.TOUCHEND, e);
        });
    }
}